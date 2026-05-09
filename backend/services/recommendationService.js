import recommendationRepository from '../repositories/recommendationRepository.js';

const RECENCY_HALF_LIFE_DAYS = 365;
const DIVERSITY_AUTHOR_PENALTY = 0.05;
const DIVERSITY_GENRE_PENALTY = 0.03;

const toIdSet = (csv) => new Set(
    String(csv || '')
        .split(',')
        .map((id) => Number(id))
        .filter(Boolean)
);

const hasIntersection = (left, right) => {
    for (const item of left) {
        if (right.has(item)) return true;
    }
    return false;
};

const normalizeByMax = (value, max) => {
    const number = Number(value) || 0;
    const maxNumber = Number(max) || 0;
    if (maxNumber <= 0) return 0;
    return Math.min(1, Math.log1p(number) / Math.log1p(maxNumber));
};

const normalizeRecency = (releaseDate) => {
    if (!releaseDate) return 0;
    const released = new Date(releaseDate).getTime();
    if (!Number.isFinite(released)) return 0;
    const ageDays = (Date.now() - released) / (1000 * 60 * 60 * 24);
    if (ageDays <= 0) return 1;
    return Math.max(0, Math.min(1, 1 - ageDays / RECENCY_HALF_LIFE_DAYS));
};

const userInterestMatch = (book, interest) => {
    const genreIds = toIdSet(book.genre_ids);
    const authorIds = toIdSet(book.author_ids);
    const interestedGenres = new Set(interest.genreIds || []);
    const interestedAuthors = new Set(interest.authorIds || []);
    let score = 0;

    if (hasIntersection(genreIds, interestedGenres)) score += 0.65;
    if (hasIntersection(authorIds, interestedAuthors)) score += 0.35;

    return Math.min(1, score);
};

const similarInterestMatch = (book, interest) => {
    const genreIds = toIdSet(book.genre_ids);
    const authorIds = toIdSet(book.author_ids);
    const targetGenres = new Set(interest.genreIds || []);
    const targetAuthors = new Set(interest.authorIds || []);
    let score = 0;

    if (hasIntersection(genreIds, targetGenres)) score += 0.7;
    if (hasIntersection(authorIds, targetAuthors)) score += 0.3;

    return Math.min(1, score);
};

const buildReasons = ({ book, interestScore, recencyScore, mode }) => {
    const reasons = [];

    if (mode === 'personalized' && interestScore > 0) {
        reasons.push('Cung the loai hoac tac gia voi sach ban quan tam');
    }

    if (mode === 'similar' && interestScore > 0) {
        reasons.push('Gan voi the loai hoac tac gia cua sach hien tai');
    }

    if (Number(book.avg_sentiment) >= 0.35) reasons.push('Nhieu danh gia co sentiment tich cuc');
    if (Number(book.avg_rating) >= 4) reasons.push('Diem rating cao');
    if (Number(book.sales_count) > 0) reasons.push('Duoc mua nhieu');
    if (Number(book.wishlist_count) > 0) reasons.push('Duoc them vao wishlist nhieu');
    if (recencyScore >= 0.7) reasons.push('Sach moi phat hanh');

    return reasons.slice(0, 3);
};

const scoreBooks = ({ rows, interest = { genreIds: [], authorIds: [] }, mode = 'trending' }) => {
    const maxReviewCount = Math.max(...rows.map((book) => Number(book.review_count) || 0), 0);
    const maxSalesCount = Math.max(...rows.map((book) => Number(book.sales_count) || 0), 0);
    const maxWishlistCount = Math.max(...rows.map((book) => Number(book.wishlist_count) || 0), 0);

    return rows.map((book) => {
        const interestScore = mode === 'similar'
            ? similarInterestMatch(book, interest)
            : userInterestMatch(book, interest);
        const recencyScore = normalizeRecency(book.release_date);
        const normalizedAverageRating = Math.min(1, (Number(book.avg_rating) || 0) / 5);
        const normalizedPositiveSentiment = Math.max(0, Math.min(1, ((Number(book.avg_sentiment) || 0) + 1) / 2));
        const normalizedReviewCount = normalizeByMax(book.review_count, maxReviewCount);
        const normalizedSalesCount = normalizeByMax(book.sales_count, maxSalesCount);
        const normalizedWishlistCount = normalizeByMax(book.wishlist_count, maxWishlistCount);
        const score =
            0.28 * normalizedAverageRating +
            0.18 * normalizedPositiveSentiment +
            0.13 * normalizedReviewCount +
            0.13 * normalizedSalesCount +
            0.09 * normalizedWishlistCount +
            0.09 * interestScore +
            0.10 * recencyScore;

        return {
            authorIds: toIdSet(book.author_ids),
            genreIds: toIdSet(book.genre_ids),
            book: {
                book_id: book.book_id,
                title: book.title,
                cover_image: book.cover_image,
                price: Number(book.price),
                stock: Number(book.stock),
                authors: book.authors || '',
                genres: book.genres || '',
                avg_rating: Number(Number(book.avg_rating || 0).toFixed(1))
            },
            score: Number(score.toFixed(4)),
            reasons: buildReasons({ book, interestScore, recencyScore, mode }),
            signals: {
                avg_rating: Number(Number(book.avg_rating || 0).toFixed(2)),
                avg_sentiment: Number(Number(book.avg_sentiment || 0).toFixed(2)),
                review_count: Number(book.review_count || 0),
                sales_count: Number(book.sales_count || 0),
                wishlist_count: Number(book.wishlist_count || 0),
                interest_match: Number(interestScore.toFixed(2)),
                recency: Number(recencyScore.toFixed(2))
            }
        };
    }).sort((a, b) => b.score - a.score);
};

const applyDiversity = (scoredBooks, limit) => {
    const picked = [];
    const remaining = [...scoredBooks];
    const usedAuthors = new Set();
    const usedGenres = new Set();

    while (picked.length < limit && remaining.length) {
        let bestIdx = 0;
        let bestAdjusted = -Infinity;

        for (let i = 0; i < remaining.length; i++) {
            const candidate = remaining[i];
            let penalty = 0;
            for (const id of candidate.authorIds) {
                if (usedAuthors.has(id)) { penalty += DIVERSITY_AUTHOR_PENALTY; break; }
            }
            for (const id of candidate.genreIds) {
                if (usedGenres.has(id)) { penalty += DIVERSITY_GENRE_PENALTY; break; }
            }
            const adjusted = candidate.score - penalty;
            if (adjusted > bestAdjusted) {
                bestAdjusted = adjusted;
                bestIdx = i;
            }
        }

        const [chosen] = remaining.splice(bestIdx, 1);
        chosen.authorIds.forEach((id) => usedAuthors.add(id));
        chosen.genreIds.forEach((id) => usedGenres.add(id));
        picked.push(chosen);
    }

    return picked.map(({ authorIds, genreIds, ...rest }) => rest);
};

const getTrendingRecommendations = async ({ limit = 10 } = {}) => {
    const rows = await recommendationRepository.findBookStats({ limit: Math.max(limit * 5, 40) });
    const scored = scoreBooks({ rows, mode: 'trending' });
    return applyDiversity(scored, limit);
};

const getPersonalizedRecommendations = async ({ userId, limit = 10 } = {}) => {
    if (!userId) return getTrendingRecommendations({ limit });

    const [rows, interest] = await Promise.all([
        recommendationRepository.findBookStats({ limit: Math.max(limit * 5, 40) }),
        recommendationRepository.findUserInterestIds(userId)
    ]);

    const filtered = rows.filter((book) => !interest.bookIds.includes(Number(book.book_id)));
    const scored = scoreBooks({ rows: filtered.length ? filtered : rows, interest, mode: 'personalized' });
    return applyDiversity(scored, limit);
};

const getSimilarBooks = async ({ bookId, limit = 10 } = {}) => {
    const [rows, interest] = await Promise.all([
        recommendationRepository.findBookStats({ excludeBookId: Number(bookId), limit: Math.max(limit * 5, 40) }),
        recommendationRepository.findBookInterestIds(Number(bookId))
    ]);

    const scored = scoreBooks({ rows, interest, mode: 'similar' });
    return applyDiversity(scored, limit);
};

export default {
    getTrendingRecommendations,
    getPersonalizedRecommendations,
    getSimilarBooks
};
