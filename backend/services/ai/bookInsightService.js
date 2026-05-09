import { Op } from 'sequelize';
import AppError from '../../errors/AppError.js';
import Book from '../../models/Book.js';
import Review from '../../models/Review.js';
import ReviewAnalysis from '../../models/ReviewAnalysis.js';
import BookInsight from '../../models/BookInsight.js';
import User from '../../models/User.js';
import { createJsonCompletion, isAiEnabled, isGroqConfigured } from './groqClient.js';
import { sanitizePii } from './sanitize.js';

const PROMPT_VERSION = 'book-insight-v1';

const emptyInsight = (bookId) => ({
    book_id: Number(bookId),
    summary: 'Chua co du review de tao insight.',
    positive_points: [],
    negative_points: [],
    reader_fit: '',
    recommendation_hint: '',
    sentiment_distribution: { positive: 0, neutral: 0, negative: 0 },
    review_count: 0,
    provider: 'fallback'
});

const arrayFrom = (value) => Array.isArray(value)
    ? value.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim()).slice(0, 6)
    : [];

const countSentiment = (reviews) => reviews.reduce((acc, review) => {
    const label = review.analysis?.sentiment_label || 'neutral';
    acc[label] = (acc[label] || 0) + 1;
    return acc;
}, { positive: 0, neutral: 0, negative: 0 });

const topSignals = (reviews, sentimentLabel) => {
    const counts = new Map();

    reviews.forEach((review) => {
        if (review.analysis?.sentiment_label !== sentimentLabel) return;
        (review.analysis?.signals || []).forEach((signal) => {
            counts.set(signal, (counts.get(signal) || 0) + 1);
        });
    });

    return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([signal]) => signal)
        .slice(0, 5);
};

const buildFallbackInsight = ({ bookId, reviews }) => {
    const distribution = countSentiment(reviews);
    const positivePoints = topSignals(reviews, 'positive');
    const negativePoints = topSignals(reviews, 'negative');
    const positiveRatio = reviews.length ? distribution.positive / reviews.length : 0;

    return {
        book_id: Number(bookId),
        summary: positiveRatio >= 0.6
            ? 'Phan lon doc gia co cam nhan tich cuc ve cuon sach nay.'
            : 'Cac review cho thay cam nhan cua doc gia con kha da dang.',
        positive_points: positivePoints,
        negative_points: negativePoints,
        reader_fit: positiveRatio >= 0.6 ? 'Phu hop voi doc gia tim mot lua chon duoc danh gia tot.' : '',
        recommendation_hint: positiveRatio >= 0.6
            ? 'Dang can nhac neu ban uu tien sach co nhieu phan hoi tich cuc.'
            : 'Nen doc them review chi tiet truoc khi quyet dinh.',
        sentiment_distribution: distribution,
        review_count: reviews.length,
        provider: 'fallback',
        model: null,
        prompt_version: PROMPT_VERSION
    };
};

const buildPrompt = ({ book, reviews }) => {
    const reviewText = reviews.slice(0, 30).map((review) => ({
        rating: review.rating,
        comment: sanitizePii(review.comment || '').slice(0, 600),
        sentiment: review.analysis?.sentiment_label,
        signals: review.analysis?.signals || []
    }));

    return `You are summarizing customer reviews for a bookstore product page.
Return only valid JSON in Vietnamese.

Book title: ${sanitizePii(book.title || '')}
Reviews:
${JSON.stringify(reviewText)}

JSON schema:
{
  "summary": string,
  "positive_points": string[],
  "negative_points": string[],
  "reader_fit": string,
  "recommendation_hint": string
}`;
};

const normalizeGroqInsight = ({ bookId, reviews, payload, completion }) => {
    const fallback = buildFallbackInsight({ bookId, reviews });

    return {
        ...fallback,
        summary: typeof payload.summary === 'string' && payload.summary.trim() ? payload.summary.trim() : fallback.summary,
        positive_points: arrayFrom(payload.positive_points),
        negative_points: arrayFrom(payload.negative_points),
        reader_fit: typeof payload.reader_fit === 'string' ? payload.reader_fit.trim() : '',
        recommendation_hint: typeof payload.recommendation_hint === 'string' ? payload.recommendation_hint.trim() : '',
        provider: completion.provider,
        model: completion.model,
        prompt_version: PROMPT_VERSION
    };
};

const findAnalyzedReviews = (bookId) => Review.findAll({
    where: { book_id: bookId },
    include: [
        { model: ReviewAnalysis, as: 'analysis', required: false },
        { model: User, attributes: ['user_id', 'name'], required: false }
    ],
    order: [['review_date', 'DESC']]
});

const saveInsight = async (insight) => {
    const payload = {
        book_id: insight.book_id,
        summary: insight.summary,
        positive_points: insight.positive_points,
        negative_points: insight.negative_points,
        reader_fit: insight.reader_fit,
        recommendation_hint: insight.recommendation_hint,
        sentiment_distribution: insight.sentiment_distribution,
        review_count: insight.review_count,
        provider: insight.provider,
        model: insight.model || null,
        prompt_version: insight.prompt_version || PROMPT_VERSION,
        generated_at: new Date()
    };

    const existing = await BookInsight.findOne({ where: { book_id: insight.book_id } });
    if (existing) {
        await existing.update(payload);
        return existing.reload();
    }

    return BookInsight.create(payload);
};

const toResponse = (insight) => {
    const plain = typeof insight.get === 'function' ? insight.get({ plain: true }) : insight;
    return {
        book_id: plain.book_id,
        summary: plain.summary,
        positive_points: plain.positive_points || [],
        negative_points: plain.negative_points || [],
        reader_fit: plain.reader_fit || '',
        recommendation_hint: plain.recommendation_hint || '',
        sentiment_distribution: plain.sentiment_distribution || { positive: 0, neutral: 0, negative: 0 },
        review_count: plain.review_count || 0,
        provider: plain.provider || 'fallback',
        generated_at: plain.generated_at
    };
};

const getBookInsights = async ({ bookId, forceRefresh = false }) => {
    const book = await Book.findByPk(bookId);
    if (!book) throw new AppError('Sach khong ton tai', 404);

    const reviewCount = await Review.count({ where: { book_id: bookId } });
    if (!reviewCount) {
        return emptyInsight(bookId);
    }

    if (!forceRefresh) {
        const latestReview = await Review.findOne({
            where: { book_id: bookId },
            attributes: ['updatedAt', 'review_date'],
            order: [['updatedAt', 'DESC']]
        });
        const latestStamp = latestReview?.updatedAt || latestReview?.review_date;

        const cached = await BookInsight.findOne({
            where: {
                book_id: bookId,
                review_count: reviewCount,
                ...(latestStamp ? { updatedAt: { [Op.gte]: latestStamp } } : {})
            }
        });

        if (cached) return toResponse(cached);
    }

    const reviews = await findAnalyzedReviews(bookId);
    let insight = buildFallbackInsight({ bookId, reviews });

    if (isAiEnabled() && isGroqConfigured()) {
        try {
            const completion = await createJsonCompletion({
                prompt: buildPrompt({ book, reviews }),
                model: process.env.GROQ_MODEL_SMART || process.env.GROQ_MODEL_FAST || 'llama-3.3-70b-versatile',
                temperature: 0.2
            });
            insight = normalizeGroqInsight({ bookId, reviews, payload: completion.data, completion });
        } catch (err) {
            console.warn(`Groq book insight failed for book ${bookId}:`, err.message);
        }
    }

    const saved = await saveInsight(insight);
    return toResponse(saved);
};

const invalidateBookInsights = async (bookId) => {
    await BookInsight.destroy({ where: { book_id: bookId } });
};

export default {
    getBookInsights,
    invalidateBookInsights
};
