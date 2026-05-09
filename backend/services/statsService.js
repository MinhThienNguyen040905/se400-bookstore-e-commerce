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

const getAiInsights = async () => {
    const negativeReviewBooks = await sequelize.query(
        `
        SELECT
            b.book_id,
            b.title,
            b.cover_image,
            COUNT(ra.analysis_id) AS analyzed_reviews,
            SUM(CASE WHEN ra.sentiment_label = 'negative' THEN 1 ELSE 0 END) AS negative_reviews,
            AVG(ra.sentiment_score) AS avg_sentiment
        FROM Books b
        INNER JOIN Reviews r ON r.book_id = b.book_id
        INNER JOIN ReviewAnalyses ra ON ra.review_id = r.review_id
        GROUP BY b.book_id, b.title, b.cover_image
        HAVING negative_reviews > 0
        ORDER BY (negative_reviews / analyzed_reviews) DESC, negative_reviews DESC
        LIMIT 8
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

    const suspiciousReviews = await Review.findAll({
        limit: 10,
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
        negative_review_books: negativeReviewBooks.map((book) => ({
            book_id: book.book_id,
            title: book.title,
            cover_image: book.cover_image,
            analyzed_reviews: Number(book.analyzed_reviews || 0),
            negative_reviews: Number(book.negative_reviews || 0),
            avg_sentiment: Number(Number(book.avg_sentiment || 0).toFixed(2))
        })),
        top_positive_genres: topPositiveGenres.map((genre) => ({
            genre_id: genre.genre_id,
            name: genre.name,
            analyzed_reviews: Number(genre.analyzed_reviews || 0),
            avg_sentiment: Number(Number(genre.avg_sentiment || 0).toFixed(2))
        })),
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
