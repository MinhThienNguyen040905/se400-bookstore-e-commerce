import User from '../models/User.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Book from '../models/Book.js';
import { Op, QueryTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Review from '../models/Review.js';
import ReviewAnalysis from '../models/ReviewAnalysis.js';

const getStats = async () => {
    const totalUsers = await User.count({
        where: { role: 'customer' }
    });

    const totalOrders = await Order.count();

    const revenueResult = await Order.sum('total_price', {
        where: {
            status: {
                [Op.in]: ['delivered', 'shipped']
            }
        }
    });

    const recentOrders = await Order.findAll({
        limit: 5,
        order: [['order_date', 'DESC']],
        include: [
            {
                model: User,
                attributes: ['user_id', 'name', 'email']
            },
            {
                model: OrderItem,
                include: [{ model: Book, attributes: ['title', 'cover_image'] }]
            }
        ]
    });

    const currentYear = new Date().getFullYear();

    const monthlyData = await Order.findAll({
        attributes: [
            [sequelize.fn('MONTH', sequelize.col('order_date')), 'month'],
            [sequelize.fn('SUM', sequelize.col('total_price')), 'revenue']
        ],
        where: {
            status: { [Op.in]: ['delivered', 'shipped'] },
            [Op.and]: [
                sequelize.where(sequelize.fn('YEAR', sequelize.col('order_date')), currentYear)
            ]
        },
        group: [sequelize.fn('MONTH', sequelize.col('order_date'))],
        raw: true
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = monthNames.map((name) => ({ name, revenue: 0 }));

    monthlyData.forEach((item) => {
        const monthIndex = item.month - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
            monthlyRevenue[monthIndex].revenue = parseFloat(item.revenue);
        }
    });

    return {
        totalUsers,
        totalOrders,
        totalRevenue: parseFloat(revenueResult || 0),
        recentOrders,
        monthlyRevenue
    };
};

const getAiInsights = async ({ suspiciousLimit = 10, recentWindowDays = 7 } = {}) => {
    const safeSuspiciousLimit = Math.min(Math.max(Number(suspiciousLimit) || 10, 1), 50);
    const safeWindowDays = Math.min(Math.max(Number(recentWindowDays) || 7, 1), 90);
    const negativeReviewBooks = await sequelize.query(
        `
        SELECT
            b.book_id,
            b.title,
            b.cover_image,
            COUNT(ra.analysis_id) AS analyzed_reviews,
            SUM(CASE WHEN ra.sentiment_label = 'negative' THEN 1 ELSE 0 END) AS negative_reviews,
            SUM(CASE WHEN ra.sentiment_label = 'negative' AND r.review_date >= DATE_SUB(NOW(), INTERVAL :windowDays DAY) THEN 1 ELSE 0 END) AS negative_reviews_recent,
            SUM(CASE WHEN r.review_date >= DATE_SUB(NOW(), INTERVAL :windowDays DAY) THEN 1 ELSE 0 END) AS analyzed_reviews_recent,
            AVG(ra.sentiment_score) AS avg_sentiment,
            AVG(r.rating) AS avg_rating
        FROM Books b
        INNER JOIN Reviews r ON r.book_id = b.book_id
        INNER JOIN ReviewAnalyses ra ON ra.review_id = r.review_id
        GROUP BY b.book_id, b.title, b.cover_image
        HAVING negative_reviews > 0
        ORDER BY (negative_reviews / analyzed_reviews) DESC, negative_reviews DESC
        LIMIT 8
        `,
        { replacements: { windowDays: safeWindowDays }, type: QueryTypes.SELECT }
    );

    const ratingSentimentMismatchBooks = await sequelize.query(
        `
        SELECT
            b.book_id,
            b.title,
            b.cover_image,
            AVG(r.rating) AS avg_rating,
            AVG(ra.sentiment_score) AS avg_sentiment,
            COUNT(ra.analysis_id) AS analyzed_reviews
        FROM Books b
        INNER JOIN Reviews r ON r.book_id = b.book_id
        INNER JOIN ReviewAnalyses ra ON ra.review_id = r.review_id
        GROUP BY b.book_id, b.title, b.cover_image
        HAVING analyzed_reviews >= 3 AND avg_rating >= 4 AND avg_sentiment < 0
        ORDER BY (avg_rating - avg_sentiment) DESC
        LIMIT 5
        `,
        { type: QueryTypes.SELECT }
    );

    const topPositiveGenres = await sequelize.query(
        `
        SELECT
            g.genre_id,
            g.name,
            AVG(ra.sentiment_score) AS avg_sentiment,
            COUNT(ra.analysis_id) AS analyzed_reviews
        FROM Genres g
        INNER JOIN BookGenres bg ON bg.genre_id = g.genre_id
        INNER JOIN Reviews r ON r.book_id = bg.book_id
        INNER JOIN ReviewAnalyses ra ON ra.review_id = r.review_id
        GROUP BY g.genre_id, g.name
        HAVING analyzed_reviews > 0
        ORDER BY avg_sentiment DESC, analyzed_reviews DESC
        LIMIT 8
        `,
        { type: QueryTypes.SELECT }
    );

    const sentimentTrend = await sequelize.query(
        `
        SELECT
            DATE(r.review_date) AS day,
            SUM(CASE WHEN ra.sentiment_label = 'positive' THEN 1 ELSE 0 END) AS positive,
            SUM(CASE WHEN ra.sentiment_label = 'neutral' THEN 1 ELSE 0 END) AS neutral,
            SUM(CASE WHEN ra.sentiment_label = 'negative' THEN 1 ELSE 0 END) AS negative
        FROM Reviews r
        INNER JOIN ReviewAnalyses ra ON ra.review_id = r.review_id
        WHERE r.review_date >= DATE_SUB(NOW(), INTERVAL :windowDays DAY)
        GROUP BY DATE(r.review_date)
        ORDER BY day ASC
        `,
        { replacements: { windowDays: safeWindowDays }, type: QueryTypes.SELECT }
    );

    const signalsRows = await sequelize.query(
        `
        SELECT signals, ra.sentiment_label
        FROM ReviewAnalyses ra
        INNER JOIN Reviews r ON r.review_id = ra.review_id
        WHERE r.review_date >= DATE_SUB(NOW(), INTERVAL :windowDays DAY)
              AND ra.signals IS NOT NULL
        `,
        { replacements: { windowDays: safeWindowDays }, type: QueryTypes.SELECT }
    );

    const keywordCounter = new Map();
    signalsRows.forEach((row) => {
        let parsed = row.signals;
        if (typeof parsed === 'string') {
            try { parsed = JSON.parse(parsed); } catch { parsed = []; }
        }
        if (!Array.isArray(parsed)) return;
        parsed.forEach((signal) => {
            if (typeof signal !== 'string') return;
            const key = signal.trim().toLowerCase();
            if (!key || key.length < 3) return;
            const entry = keywordCounter.get(key) || { keyword: key, count: 0, positive: 0, negative: 0, neutral: 0 };
            entry.count += 1;
            entry[row.sentiment_label] = (entry[row.sentiment_label] || 0) + 1;
            keywordCounter.set(key, entry);
        });
    });
    const topKeywords = [...keywordCounter.values()]
        .sort((a, b) => b.count - a.count)
        .slice(0, 12);

    const suspiciousReviews = await Review.findAll({
        limit: safeSuspiciousLimit,
        include: [
            { model: User, attributes: ['user_id', 'name'] },
            { model: Book, attributes: ['book_id', 'title'] },
            {
                model: ReviewAnalysis,
                as: 'analysis',
                required: true,
                where: { spam_risk: { [Op.in]: ['medium', 'high'] } }
            }
        ],
        order: [['review_date', 'DESC']]
    });

    return {
        window_days: safeWindowDays,
        negative_review_books: negativeReviewBooks.map((book) => ({
            book_id: book.book_id,
            title: book.title,
            cover_image: book.cover_image,
            analyzed_reviews: Number(book.analyzed_reviews || 0),
            negative_reviews: Number(book.negative_reviews || 0),
            analyzed_reviews_recent: Number(book.analyzed_reviews_recent || 0),
            negative_reviews_recent: Number(book.negative_reviews_recent || 0),
            negative_ratio_recent: Number(book.analyzed_reviews_recent) > 0
                ? Number((Number(book.negative_reviews_recent) / Number(book.analyzed_reviews_recent)).toFixed(2))
                : 0,
            avg_sentiment: Number(Number(book.avg_sentiment || 0).toFixed(2)),
            avg_rating: Number(Number(book.avg_rating || 0).toFixed(2))
        })),
        rating_sentiment_mismatch: ratingSentimentMismatchBooks.map((book) => ({
            book_id: book.book_id,
            title: book.title,
            cover_image: book.cover_image,
            avg_rating: Number(Number(book.avg_rating || 0).toFixed(2)),
            avg_sentiment: Number(Number(book.avg_sentiment || 0).toFixed(2)),
            analyzed_reviews: Number(book.analyzed_reviews || 0)
        })),
        top_positive_genres: topPositiveGenres.map((genre) => ({
            genre_id: genre.genre_id,
            name: genre.name,
            analyzed_reviews: Number(genre.analyzed_reviews || 0),
            avg_sentiment: Number(Number(genre.avg_sentiment || 0).toFixed(2))
        })),
        sentiment_trend: sentimentTrend.map((row) => ({
            day: row.day,
            positive: Number(row.positive || 0),
            neutral: Number(row.neutral || 0),
            negative: Number(row.negative || 0)
        })),
        top_keywords: topKeywords,
        suspicious_reviews: suspiciousReviews.map((review) => ({
            review_id: review.review_id,
            rating: review.rating,
            comment: review.comment,
            review_date: review.review_date,
            user: review.User ? { user_id: review.User.user_id, name: review.User.name } : null,
            book: review.Book ? { book_id: review.Book.book_id, title: review.Book.title } : null,
            spam_risk: review.analysis?.spam_risk,
            spam_reasons: review.analysis?.spam_reasons || [],
            sentiment_label: review.analysis?.sentiment_label,
            sentiment_score: Number(review.analysis?.sentiment_score || 0)
        }))
    };
};

export default { getStats, getAiInsights };
