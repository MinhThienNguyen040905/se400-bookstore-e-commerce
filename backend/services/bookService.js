import { Op } from 'sequelize';
import sequelize from '../config/db.js';
import AppError from '../errors/AppError.js';
import Book from '../models/Book.js';
import Author from '../models/Author.js';
import Genre from '../models/Genre.js';
import Publisher from '../models/Publisher.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import Wishlist from '../models/Wishlist.js';
import cloudinary from '../cloudinary.js';
import fs from 'fs';

const parseIds = (input) => {
    if (!input) return [];

    if (Array.isArray(input)) {
        return input.map((id) => parseInt(id)).filter((id) => !Number.isNaN(id));
    }

    if (typeof input === 'string') {
        if (input.startsWith('[')) {
            try {
                return JSON.parse(input).map((id) => parseInt(id)).filter((id) => !Number.isNaN(id));
            } catch (err) {
                return [];
            }
        }

        return input.split(',').map((id) => parseInt(id.trim())).filter((id) => !Number.isNaN(id));
    }

    const parsed = parseInt(input);
    return Number.isNaN(parsed) ? [] : [parsed];
};

const cleanupTempFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

const destroyCloudinaryImage = async (imageUrl) => {
    if (!imageUrl) return;

    const urlParts = imageUrl.split('/');
    const publicIdWithExt = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExt.split('.')[0];
    await cloudinary.uploader.destroy(publicId);
};

const buildBookFilters = ({ keyword, min_price, max_price }) => {
    const where = {};

    if (keyword) {
        where.title = { [Op.like]: `%${keyword}%` };
    }

    if (min_price || max_price) {
        where.price = {};
        if (min_price) where.price[Op.gte] = parseFloat(min_price);
        if (max_price) where.price[Op.lte] = parseFloat(max_price);
    }

    return where;
};

const avgRatingExpr = sequelize.fn('COALESCE', sequelize.fn('AVG', sequelize.col('Reviews.rating')), 0);

const buildBookOrder = (sort) => {
    switch (sort) {
        case 'price-asc':
            return [['price', 'ASC']];
        case 'price-desc':
            return [['price', 'DESC']];
        case 'newest':
            return [['release_date', 'DESC']];
        case 'top-rated':
            return [[avgRatingExpr, 'DESC']];
        default:
            return [['book_id', 'DESC']];
    }
};

const addBook = async ({ bookData, coverFile }) => {
    let coverImage = '';

    try {
        if (coverFile) {
            const result = await cloudinary.uploader.upload(coverFile.path);
            coverImage = result.secure_url;
        }

        const book = await Book.create({
            title: bookData.title,
            description: bookData.description,
            publisher_id: bookData.publisher_id,
            stock: bookData.stock,
            price: bookData.price,
            cover_image: coverImage,
            release_date: bookData.release_date,
            isbn: bookData.isbn
        });

        if (bookData.authors) {
            const authorIds = parseIds(bookData.authors);
            if (authorIds.length > 0) {
                await book.addAuthors(authorIds);
            }
        }

        if (bookData.genres) {
            const genreIds = parseIds(bookData.genres);
            if (genreIds.length > 0) {
                await book.addGenres(genreIds);
            }
        }

        return { book_id: book.book_id };
    } catch (err) {
        throw new AppError(err.message || 'Loi them sach', 400);
    } finally {
        cleanupTempFile(coverFile?.path);
    }
};

const getBooks = async (query) => {
    const { keyword, min_price, max_price, genre, author, rating, sort, page = 1, limit = 20 } = query;
    const where = buildBookFilters({ keyword, min_price, max_price });
    const currentPage = Math.max(parseInt(page) || 1, 1);
    const queryLimit = Math.max(parseInt(limit) || 20, 1);
    const offset = (currentPage - 1) * queryLimit;

    const includeForFilter = [{ model: Review, attributes: [], required: false }];
    const havingConditions = [];

    if (rating) {
        havingConditions.push(sequelize.where(avgRatingExpr, Op.gte, parseFloat(rating)));
    }

    if (genre) {
        const genreValues = genre.split(',').map((g) => g.trim());
        const uniqueGenres = [...new Set(genreValues)];
        const genreCount = uniqueGenres.length;
        const isNumeric = uniqueGenres.every((g) => !Number.isNaN(Number(g)));

        includeForFilter.push({
            model: Genre,
            attributes: [],
            through: { attributes: [] },
            where: isNumeric
                ? { genre_id: { [Op.in]: uniqueGenres } }
                : { name: { [Op.in]: uniqueGenres } },
            required: true
        });

        const genreCountExpr = sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('Genres.genre_id')));
        havingConditions.push(sequelize.where(genreCountExpr, Op.eq, genreCount));
    }

    if (author) {
        const authorValues = author.split(',').map((a) => a.trim());
        const uniqueAuthors = [...new Set(authorValues)];
        const authorCount = uniqueAuthors.length;
        const isNumeric = uniqueAuthors.every((a) => !Number.isNaN(Number(a)));

        includeForFilter.push({
            model: Author,
            attributes: [],
            through: { attributes: [] },
            where: isNumeric
                ? { author_id: { [Op.in]: uniqueAuthors } }
                : { name: { [Op.in]: uniqueAuthors } },
            required: true
        });

        const authorCountExpr = sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('Authors.author_id')));
        havingConditions.push(sequelize.where(authorCountExpr, Op.eq, authorCount));
    }

    const finalHaving = havingConditions.length > 0 ? { [Op.and]: havingConditions } : undefined;
    const orderClause = buildBookOrder(sort);

    const baseGroupOptions = {
        where,
        include: includeForFilter,
        group: ['Book.book_id'],
        having: finalHaving,
        subQuery: false,
        raw: true
    };

    const filteredBooks = await Book.findAll({
        ...baseGroupOptions,
        attributes: ['book_id', 'price', 'release_date', [avgRatingExpr, 'avgRating']],
        order: orderClause,
        limit: queryLimit,
        offset
    });

    const totalDocs = (await Book.findAll({
        ...baseGroupOptions,
        attributes: ['book_id'],
        order: undefined,
        limit: undefined,
        offset: undefined
    })).length;

    if (!filteredBooks.length) {
        return {
            books: [],
            pagination: { page: currentPage, limit: queryLimit, total: 0, totalPages: 0 }
        };
    }

    const targetIds = filteredBooks.map((book) => book.book_id);
    const ratingMap = filteredBooks.reduce((acc, book) => {
        acc[book.book_id] = Number(book.avgRating ?? 0);
        return acc;
    }, {});

    const finalBooks = await Book.findAll({
        where: { book_id: { [Op.in]: targetIds } },
        include: [
            { model: Publisher, attributes: ['name'] },
            { model: Author, attributes: ['name'], through: { attributes: [] } },
            { model: Genre, attributes: ['name'], through: { attributes: [] } }
        ],
        order: [[sequelize.literal(`FIELD(Book.book_id, ${targetIds.join(',')})`)]]
    });

    return {
        books: finalBooks.map((book) => {
            const bookData = book.get({ plain: true });
            return {
                book_id: bookData.book_id,
                title: bookData.title,
                cover_image: bookData.cover_image,
                price: Number(bookData.price),
                stock: bookData.stock,
                avg_rating: Number((ratingMap[bookData.book_id] ?? 0).toFixed(1)),
                publisher: bookData.Publisher?.name || null,
                authors: bookData.Authors?.map((a) => a.name).join(', ') || '',
                genres: bookData.Genres?.map((g) => g.name).join(', ') || ''
            };
        }),
        pagination: {
            page: currentPage,
            limit: queryLimit,
            total: totalDocs,
            totalPages: Math.ceil(totalDocs / queryLimit)
        }
    };
};

const getNewReleases = async () => {
    const books = await Book.findAll({
        order: [['release_date', 'DESC']],
        limit: 10,
        attributes: ['book_id', 'title', 'cover_image', 'release_date', 'price'],
        include: [{ model: Author, attributes: ['name'], through: { attributes: [] } }]
    });

    return books.map((book) => ({
        book_id: book.book_id,
        title: book.title,
        cover_image: book.cover_image,
        price: Number(book.price),
        release_date: book.release_date,
        authors: book.Authors.map((a) => a.name).join(', ')
    }));
};

const getTopRatedBooks = async () => {
    const books = await Book.findAll({
        limit: 10,
        attributes: [
            'book_id',
            'title',
            'cover_image',
            'price',
            [sequelize.fn('AVG', sequelize.col('Reviews.rating')), 'avgRating'],
            [sequelize.fn('COUNT', sequelize.col('Reviews.review_id')), 'totalReviews'],
            [sequelize.fn('GROUP_CONCAT', sequelize.literal('DISTINCT `Authors`.`name`')), 'authorsNames']
        ],
        include: [
            { model: Author, attributes: [], through: { attributes: [] } },
            { model: Review, attributes: [], required: false }
        ],
        group: ['Book.book_id'],
        having: sequelize.where(
            sequelize.fn('COUNT', sequelize.col('Reviews.review_id')),
            '>=',
            1
        ),
        order: [[sequelize.fn('AVG', sequelize.col('Reviews.rating')), 'DESC']],
        subQuery: false,
        raw: true
    });

    return books.map((book) => ({
        book_id: book.book_id,
        title: book.title,
        cover_image: book.cover_image,
        price: Number(book.price),
        avgRating: Number(book.avgRating || 0).toFixed(1),
        totalReviews: Number(book.totalReviews || 0),
        authors: book.authorsNames ? book.authorsNames.split(',').map((n) => n.trim()).join(', ') : ''
    }));
};

const getBookById = async ({ bookId, userId }) => {
    const book = await Book.findByPk(bookId, {
        attributes: { exclude: ['createdAt', 'updatedAt', 'publisher_id'] },
        include: [
            { model: Author, attributes: ['name'], through: { attributes: [] } },
            { model: Genre, attributes: ['genre_id', 'name'], through: { attributes: [] } },
            { model: Publisher, attributes: ['name'] },
            {
                model: Review,
                attributes: ['review_id', 'rating', 'comment', 'review_date'],
                include: [{ model: User, attributes: ['user_id', 'name', 'avatar'] }]
            }
        ]
    });

    if (!book) {
        throw new AppError('Sach khong ton tai', 404);
    }

    let isInWishlist = false;
    if (userId) {
        const wishlistEntry = await Wishlist.findOne({
            where: { user_id: userId, book_id: bookId }
        });
        isInWishlist = !!wishlistEntry;
    }

    const avgResult = await Review.findOne({
        where: { book_id: bookId },
        attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating']],
        raw: true
    });

    const avgRating = avgResult?.avg_rating ? parseFloat(avgResult.avg_rating) : 0;

    return {
        book_id: book.book_id,
        title: book.title,
        description: book.description,
        price: Number(book.price),
        stock: book.stock,
        cover_image: book.cover_image,
        release_date: book.release_date,
        isbn: book.isbn,
        publisher: book.Publisher?.name,
        authors: book.Authors?.map((a) => a.name).join(', '),
        genres: book.Genres,
        avg_rating: Number(avgRating.toFixed(1)),
        is_in_wishlist: isInWishlist,
        reviews: book.Reviews?.map((review) => ({
            review_id: review.review_id,
            rating: review.rating,
            comment: review.comment,
            review_date: review.review_date,
            user: {
                user_id: review.User?.user_id,
                name: review.User?.name,
                avatar: review.User?.avatar
            }
        })) || []
    };
};

const updateBook = async ({ bookId, bookData, coverFile }) => {
    try {
        if (Number.isNaN(Number(bookId))) {
            throw new AppError('ID sach khong hop le', 400);
        }

        const book = await Book.findByPk(bookId);
        if (!book) {
            throw new AppError('Khong tim thay sach', 404);
        }

        if (bookData.price !== undefined && (Number.isNaN(Number(bookData.price)) || Number(bookData.price) < 0)) {
            throw new AppError('Gia sach phai la so duong', 400);
        }

        if (bookData.stock !== undefined && (Number.isNaN(Number(bookData.stock)) || Number(bookData.stock) < 0)) {
            throw new AppError('Ton kho phai la so duong', 400);
        }

        let coverImage;
        if (coverFile) {
            const result = await cloudinary.uploader.upload(coverFile.path);
            coverImage = result.secure_url;

            try {
                await destroyCloudinaryImage(book.cover_image);
            } catch (err) {
                console.log('Loi xoa anh cu:', err.message);
            }
        }

        await book.update({
            title: bookData.title,
            description: bookData.description,
            publisher_id: bookData.publisher_id,
            stock: bookData.stock,
            price: bookData.price,
            release_date: bookData.release_date,
            isbn: bookData.isbn,
            ...(coverImage && { cover_image: coverImage })
        });

        if (bookData.authors !== undefined) {
            await book.setAuthors(parseIds(bookData.authors));
        }

        if (bookData.genres !== undefined) {
            await book.setGenres(parseIds(bookData.genres));
        }

        return { book_id: book.book_id };
    } finally {
        cleanupTempFile(coverFile?.path);
    }
};

const deleteBook = async ({ bookId }) => {
    if (Number.isNaN(Number(bookId))) {
        throw new AppError('ID sach khong hop le', 400);
    }

    const book = await Book.findByPk(bookId);
    if (!book) {
        throw new AppError('Khong tim thay sach', 404);
    }

    if (book.cover_image) {
        try {
            await destroyCloudinaryImage(book.cover_image);
        } catch (err) {
            console.log('Khong xoa duoc anh:', err.message);
        }
    }

    await book.destroy();
};

const getAllBooksSystem = async ({ page, limit }) => {
    const currentPage = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 20;
    const offset = (currentPage - 1) * pageSize;

    const { count, rows } = await Book.findAndCountAll({
        limit: pageSize,
        offset,
        order: [['book_id', 'DESC']],
        include: [
            { model: Publisher, attributes: ['publisher_id', 'name'] },
            { model: Author, attributes: ['author_id', 'name'], through: { attributes: [] } },
            { model: Genre, attributes: ['genre_id', 'name'], through: { attributes: [] } }
        ],
        distinct: true
    });

    return {
        books: rows,
        pagination: {
            totalItems: count,
            totalPages: Math.ceil(count / pageSize),
            currentPage,
            pageSize
        }
    };
};

export default {
    addBook,
    getBooks,
    getNewReleases,
    getTopRatedBooks,
    getBookById,
    updateBook,
    deleteBook,
    getAllBooksSystem
};
