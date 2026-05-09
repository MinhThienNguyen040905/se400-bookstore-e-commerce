import sequelize from '../config/db.js';
import { QueryTypes } from 'sequelize';

const COMPLETED_ORDER_STATUSES = ['processing', 'shipped', 'delivered'];

const findBookStats = async ({ excludeBookId = null, limit = 80 } = {}) => {
    const rows = await sequelize.query(
        `
        SELECT
            b.book_id,
            b.title,
            b.cover_image,
            b.price,
            b.stock,
            b.release_date,
            COALESCE(AVG(r.rating), 0) AS avg_rating,
            COUNT(DISTINCT r.review_id) AS review_count,
            COALESCE(AVG(ra.sentiment_score), 0) AS avg_sentiment,
            COALESCE(sales.sales_count, 0) AS sales_count,
            COALESCE(wishlist.wishlist_count, 0) AS wishlist_count,
            GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', ') AS authors,
            GROUP_CONCAT(DISTINCT g.name ORDER BY g.name SEPARATOR ', ') AS genres,
            GROUP_CONCAT(DISTINCT ba.author_id) AS author_ids,
            GROUP_CONCAT(DISTINCT bg.genre_id) AS genre_ids
        FROM Books b
        LEFT JOIN Reviews r ON r.book_id = b.book_id
        LEFT JOIN ReviewAnalyses ra ON ra.review_id = r.review_id
        LEFT JOIN (
            SELECT oi.book_id, SUM(oi.quantity) AS sales_count
            FROM OrderItems oi
            INNER JOIN Orders o ON o.order_id = oi.order_id
            WHERE o.status IN (:completedStatuses)
            GROUP BY oi.book_id
        ) sales ON sales.book_id = b.book_id
        LEFT JOIN (
            SELECT book_id, COUNT(*) AS wishlist_count
            FROM Wishlists
            GROUP BY book_id
        ) wishlist ON wishlist.book_id = b.book_id
        LEFT JOIN BookAuthors ba ON ba.book_id = b.book_id
        LEFT JOIN Authors a ON a.author_id = ba.author_id
        LEFT JOIN BookGenres bg ON bg.book_id = b.book_id
        LEFT JOIN Genres g ON g.genre_id = bg.genre_id
        WHERE (:excludeBookId IS NULL OR b.book_id != :excludeBookId)
        GROUP BY b.book_id, b.title, b.cover_image, b.price, b.stock, b.release_date, sales.sales_count, wishlist.wishlist_count
        LIMIT :limit
        `,
        {
            replacements: { completedStatuses: COMPLETED_ORDER_STATUSES, excludeBookId, limit },
            type: QueryTypes.SELECT
        }
    );

    return rows;
};

const findUserInterestIds = async (userId) => {
    if (!userId) return { genreIds: [], authorIds: [], bookIds: [] };

    const bookRows = await sequelize.query(
        `
        SELECT DISTINCT book_id FROM (
            SELECT oi.book_id
            FROM OrderItems oi
            INNER JOIN Orders o ON o.order_id = oi.order_id
            WHERE o.user_id = :userId AND o.status IN (:completedStatuses)
            UNION
            SELECT book_id FROM Wishlists WHERE user_id = :userId
            UNION
            SELECT book_id FROM Reviews WHERE user_id = :userId
        ) user_books
        `,
        {
            replacements: { userId, completedStatuses: COMPLETED_ORDER_STATUSES },
            type: QueryTypes.SELECT
        }
    );

    const bookIds = bookRows.map((row) => Number(row.book_id)).filter(Boolean);
    if (!bookIds.length) return { genreIds: [], authorIds: [], bookIds: [] };

    const [genreRows, authorRows] = await Promise.all([
        sequelize.query(
            'SELECT DISTINCT genre_id FROM BookGenres WHERE book_id IN (:bookIds)',
            { replacements: { bookIds }, type: QueryTypes.SELECT }
        ),
        sequelize.query(
            'SELECT DISTINCT author_id FROM BookAuthors WHERE book_id IN (:bookIds)',
            { replacements: { bookIds }, type: QueryTypes.SELECT }
        )
    ]);

    return {
        bookIds,
        genreIds: genreRows.map((row) => Number(row.genre_id)).filter(Boolean),
        authorIds: authorRows.map((row) => Number(row.author_id)).filter(Boolean)
    };
};

const findBookInterestIds = async (bookId) => {
    const [genreRows, authorRows] = await Promise.all([
        sequelize.query(
            'SELECT DISTINCT genre_id FROM BookGenres WHERE book_id = :bookId',
            { replacements: { bookId }, type: QueryTypes.SELECT }
        ),
        sequelize.query(
            'SELECT DISTINCT author_id FROM BookAuthors WHERE book_id = :bookId',
            { replacements: { bookId }, type: QueryTypes.SELECT }
        )
    ]);

    return {
        genreIds: genreRows.map((row) => Number(row.genre_id)).filter(Boolean),
        authorIds: authorRows.map((row) => Number(row.author_id)).filter(Boolean)
    };
};

export default {
    findBookStats,
    findUserInterestIds,
    findBookInterestIds
};
