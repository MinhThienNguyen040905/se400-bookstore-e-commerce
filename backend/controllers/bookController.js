// controllers/bookController.js
import { Op } from 'sequelize';
import sequelize from '../config/db.js';
import Book from '../models/Book.js';
import Author from '../models/Author.js';
import Genre from '../models/Genre.js';
import Publisher from '../models/Publisher.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import Wishlist from '../models/Wishlist.js';
import cloudinary from '../cloudinary.js';
import multer from 'multer';
import fs from 'fs';

// const upload = multer({ dest: 'uploads/' });
import os from 'os';
const upload = multer({ dest: os.tmpdir() });
const uploadCover = upload.single('cover_image');


const parseIds = (input) => {
    if (!input) return [];

    // Trường hợp 1: Đã là mảng (nếu frontend gửi dạng json hoặc x-www-form-urlencoded chuẩn)
    if (Array.isArray(input)) {
        return input.map(id => parseInt(id)).filter(id => !isNaN(id));
    }

    // Trường hợp 2: Là chuỗi
    if (typeof input === 'string') {
        // Nếu là chuỗi JSON "[1,2]"
        if (input.startsWith('[')) {
            try {
                return JSON.parse(input).map(id => parseInt(id));
            } catch (e) {
                return [];
            }
        }
        // Nếu là chuỗi ngăn cách dấu phẩy "1,2,3"
        return input.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    }

    // Trường hợp 3: Là số đơn lẻ
    return [parseInt(input)];
};

// === ADD BOOK ===
const addBook = async (req, res) => {
    // authors và genres nhận vào là danh sách ID (VD: "1,2" hoặc [1,2])
    const { title, description, publisher_id, stock, price, release_date, isbn, authors, genres } = req.body;

    try {
        let cover_image = '';
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            cover_image = result.secure_url;
            fs.unlinkSync(req.file.path);
        }

        // Tạo sách
        const book = await Book.create({
            title, description, publisher_id, stock, price,
            cover_image, release_date, isbn
        });

        // Xử lý Authors (Many-to-Many)
        // Sequelize hỗ trợ truyền trực tiếp mảng ID vào hàm add/set
        if (authors) {
            const authorIds = parseIds(authors);
            if (authorIds.length > 0) {
                await book.addAuthors(authorIds); // [cite: 2134]
            }
        }

        // Xử lý Genres (Many-to-Many)
        if (genres) {
            const genreIds = parseIds(genres);
            if (genreIds.length > 0) {
                await book.addGenres(genreIds); // [cite: 2147]
            }
        }

        res.success({ book_id: book.book_id }, 'Thêm sách thành công', 201);
    } catch (err) {
        // Xóa ảnh nếu tạo sách thất bại (dọn rác)
        if (req.file && !res.headersSent) {
            // Logic xóa ảnh trên cloud nếu cần
        }
        console.error(err);
        res.error(err.message || 'Lỗi thêm sách', 400);
    }
};

// === HELPER: Build WHERE clause for books ===
const buildBookFilters = (queryParams) => {
    const { keyword, min_price, max_price } = queryParams;
    const where = {};

    // Search by title
    if (keyword) {
        where.title = { [Op.like]: `%${keyword}%` };
    }

    // Price range filter
    if (min_price || max_price) {
        where.price = {};
        if (min_price) where.price[Op.gte] = parseFloat(min_price);
        if (max_price) where.price[Op.lte] = parseFloat(max_price);
    }

    return where;
};

// === HELPER: Build ORDER clause ===
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
            return [['book_id', 'DESC']]; // Default: newest added
    }
};

// === GET ALL BOOKS (ENHANCED) ===
// === GET ALL BOOKS (Strict Mode: Genre=AND, Author=AND) ===
const getBooks = async (req, res) => {
    const { keyword, min_price, max_price, genre, author, rating, sort, page = 1, limit = 20 } = req.query;

    try {
        // --- A. Build basic filters (Title, Price) ---
        const where = buildBookFilters({ keyword, min_price, max_price });

        // --- B. Pagination ---
        const currentPage = Math.max(parseInt(page) || 1, 1);
        const queryLimit = Math.max(parseInt(limit) || 20, 1);
        const offset = (currentPage - 1) * queryLimit;

        // --- C. Prepare Includes & Having ---
        const includeForFilter = [
            { model: Review, attributes: [], required: false }
        ];

        // Mảng chứa các điều kiện HAVING (Rating, Genre Count, Author Count)
        const havingConditions = [];

        // --- D. LOGIC RATING ---
        if (rating) {
            havingConditions.push(sequelize.where(avgRatingExpr, Op.gte, parseFloat(rating)));
        }

        // --- E. LOGIC GENRE (AND - GIAO) ---
        // Sách phải có ĐỦ tất cả các thể loại được chọn
        if (genre) {
            const genreValues = genre.split(',').map(g => g.trim());
            const uniqueGenres = [...new Set(genreValues)]; // Loại bỏ trùng lặp
            const genreCount = uniqueGenres.length;
            const isNumeric = uniqueGenres.every(g => !isNaN(g));

            includeForFilter.push({
                model: Genre,
                attributes: [],
                through: { attributes: [] },
                where: isNumeric
                    ? { genre_id: { [Op.in]: uniqueGenres } }
                    : { name: { [Op.in]: uniqueGenres } },
                required: true
            });

            // Điều kiện: Số lượng genre của sách phải bằng số lượng genre yêu cầu
            const genreCountExpr = sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('Genres.genre_id')));
            havingConditions.push(sequelize.where(genreCountExpr, Op.eq, genreCount));
        }

        // --- F. LOGIC AUTHOR (AND - GIAO) ---
        // Sách phải do ĐỦ tất cả các tác giả được chọn cùng viết (Đồng tác giả)
        if (author) {
            const authorValues = author.split(',').map(a => a.trim());
            const uniqueAuthors = [...new Set(authorValues)]; // Loại bỏ trùng lặp
            const authorCount = uniqueAuthors.length;
            const isNumeric = authorValues.every(a => !isNaN(a));

            includeForFilter.push({
                model: Author,
                attributes: [],
                through: { attributes: [] },
                where: isNumeric
                    ? { author_id: { [Op.in]: uniqueAuthors } }
                    : { name: { [Op.in]: uniqueAuthors } },
                required: true
            });

            // Điều kiện: Số lượng tác giả của sách phải bằng số lượng tác giả yêu cầu
            const authorCountExpr = sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('Authors.author_id')));
            havingConditions.push(sequelize.where(authorCountExpr, Op.eq, authorCount));
        }

        // --- G. Final Query Assembly ---
        // Kết hợp tất cả điều kiện HAVING bằng toán tử AND
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

        const pageGroupOptions = {
            ...baseGroupOptions,
            attributes: ['book_id', 'price', 'release_date', [avgRatingExpr, 'avgRating']],
            order: orderClause,
            limit: queryLimit,
            offset
        };

        const countGroupOptions = {
            ...baseGroupOptions,
            attributes: ['book_id'],
            order: undefined,
            limit: undefined,
            offset: undefined
        };

        // --- H. Execute ---
        const filteredBooks = await Book.findAll(pageGroupOptions);
        const totalDocs = (await Book.findAll(countGroupOptions)).length;

        if (!filteredBooks.length) {
            return res.success({
                books: [],
                pagination: { page: currentPage, limit: queryLimit, total: 0, totalPages: 0 }
            }, 'Không tìm thấy sách nào');
        }

        // --- I. Fetch Details ---
        const targetIds = filteredBooks.map(book => book.book_id);
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

        const result = finalBooks.map(book => {
            const bookData = book.get({ plain: true });
            return {
                book_id: bookData.book_id,
                title: bookData.title,
                cover_image: bookData.cover_image,
                price: Number(bookData.price),
                stock: bookData.stock,
                avg_rating: Number((ratingMap[bookData.book_id] ?? 0).toFixed(1)),
                publisher: bookData.Publisher?.name || null,
                authors: bookData.Authors?.map(a => a.name).join(', ') || '',
                genres: bookData.Genres?.map(g => g.name).join(', ') || ''
            };
        });

        res.success({
            books: result,
            pagination: {
                page: currentPage,
                limit: queryLimit,
                total: totalDocs,
                totalPages: Math.ceil(totalDocs / queryLimit)
            }
        }, 'Lấy danh sách sách thành công');

    } catch (err) {
        console.error('getBooks error:', err);
        res.error('Lỗi server', 500);
    }
};
// === GET NEW RELEASES ===
const getNewReleases = async (req, res) => {
    try {
        const books = await Book.findAll({
            order: [['release_date', 'DESC']],
            limit: 10,
            attributes: ['book_id', 'title', 'cover_image', 'release_date', 'price'],
            include: [
                { model: Author, attributes: ['name'], through: { attributes: [] } }
            ]
        });

        const result = books.map(book => ({
            book_id: book.book_id,
            title: book.title,
            cover_image: book.cover_image,
            price: Number(book.price),
            release_date: book.release_date,
            authors: book.Authors.map(a => a.name).join(', ')
        }));

        res.success(result, 'Lấy sách mới nhất thành công');
    } catch (err) {
        res.error('Lỗi server', 500);
    }
};

// === GET TOP RATED BOOKS ===
const getTopRatedBooks = async (req, res) => {
    try {
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

        const result = books.map(book => ({
            book_id: book.book_id,
            title: book.title,
            cover_image: book.cover_image,
            price: Number(book.price),
            avgRating: Number(book.avgRating || 0).toFixed(1),
            totalReviews: Number(book.totalReviews || 0),
            authors: book.authorsNames ? book.authorsNames.split(',').map(n => n.trim()).join(', ') : ''
        }));

        res.success(result, 'Lấy top sách thành công');
    } catch (err) {
        res.error('Lỗi server', 500);
    }
};

// === GET BOOK BY ID (Đã chỉnh sửa) ===
const getBookById = async (req, res) => {
    const { id } = req.params;
    try {
        const book = await Book.findByPk(id, {
            attributes: { exclude: ['createdAt', 'updatedAt', 'publisher_id'] },
            include: [
                { model: Author, attributes: ['name'], through: { attributes: [] } },
                { model: Genre, attributes: ['genre_id', 'name'], through: { attributes: [] } },
                { model: Publisher, attributes: ['name'] },
                {
                    model: Review,
                    attributes: ['review_id', 'rating', 'comment', 'review_date'],
                    include: [
                        { model: User, attributes: ['user_id', 'name', 'avatar'] }
                    ]
                }
            ]
        });

        if (!book) return res.error('Sách không tồn tại', 404);

        // --- LOGIC MỚI: CHECK WISHLIST ---
        let is_in_wishlist = false;

        // Nếu optionalAuth đã tìm thấy user từ token
        if (req.user && req.user.user_id) {
            const wishlistEntry = await Wishlist.findOne({
                where: {
                    user_id: req.user.user_id,
                    book_id: id
                }
            });
            // Nếu tìm thấy bản ghi => true, ngược lại false
            is_in_wishlist = !!wishlistEntry;
        }
        // ---------------------------------

        const avgResult = await Review.findOne({
            where: { book_id: id },
            attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating']],
            raw: true
        });

        const avgRating = avgResult?.avg_rating
            ? parseFloat(avgResult.avg_rating)
            : 0;

        const result = {
            book_id: book.book_id,
            title: book.title,
            description: book.description,
            price: Number(book.price),
            stock: book.stock,
            cover_image: book.cover_image,
            release_date: book.release_date,
            isbn: book.isbn,
            publisher: book.Publisher?.name,
            authors: book.Authors?.map(a => a.name).join(', '),
            genres: book.Genres,
            avg_rating: Number(avgRating.toFixed(1)),

            is_in_wishlist, // <--- TRẢ VỀ TRƯỜNG MỚI TẠI ĐÂY

            reviews: book.Reviews?.map(r => ({
                review_id: r.review_id,
                rating: r.rating,
                comment: r.comment,
                review_date: r.review_date,
                user: {
                    user_id: r.User?.user_id,
                    name: r.User?.name,
                    avatar: r.User?.avatar
                }
            })) || []
        };

        res.success(result, 'Lấy thông tin sách thành công');
    } catch (err) {
        console.error(err);
        res.error('Lỗi server', 500);
    }
};
// === UPDATE BOOK ===
const updateBook = async (req, res) => {
    const { id } = req.params;
    const { title, description, publisher_id, stock, price, release_date, isbn, authors, genres } = req.body;

    try {
        if (isNaN(id)) return res.error('ID sách không hợp lệ', 400);

        const book = await Book.findByPk(id);
        if (!book) return res.error('Không tìm thấy sách', 404);

        // Validation cơ bản
        if (price !== undefined && (isNaN(price) || price < 0)) return res.error('Giá sách phải là số dương', 400);
        if (stock !== undefined && (isNaN(stock) || stock < 0)) return res.error('Tồn kho phải là số dương', 400);

        // Xử lý ảnh mới
        let cover_image = undefined;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            cover_image = result.secure_url;
            fs.unlinkSync(req.file.path);

            // Xóa ảnh cũ
            if (book.cover_image) {
                try {
                    const publicId = book.cover_image.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                } catch (e) { console.log('Lỗi xóa ảnh cũ:', e.message); }
            }
        }

        // Update thông tin cơ bản
        await book.update({
            title, description, publisher_id, stock, price, release_date, isbn,
            ...(cover_image && { cover_image }) // Chỉ update nếu có ảnh mới
        });

        // Update Authors (Dùng setAuthors để thay thế toàn bộ danh sách cũ bằng mới)
        if (authors !== undefined) {
            const authorIds = parseIds(authors);
            // setAuthors([]) sẽ xóa hết tác giả nếu mảng rỗng, đúng ý đồ update
            await book.setAuthors(authorIds);
        }

        // Update Genres (Tương tự)
        if (genres !== undefined) {
            const genreIds = parseIds(genres);
            await book.setGenres(genreIds);
        }

        res.success({ book_id: book.book_id }, 'Cập nhật sách thành công');

    } catch (err) {
        console.error('Update book error:', err);
        res.error(err.message || 'Lỗi cập nhật sách', 400);
    }
};

// === DELETE BOOK ===
const deleteBook = async (req, res) => {
    const { id } = req.params;

    try {
        // Validation: ID phải là số
        if (isNaN(id)) {
            return res.error('ID sách không hợp lệ', 400);
        }

        const book = await Book.findByPk(id);
        if (!book) {
            return res.error('Không tìm thấy sách', 404);
        }

        // (Bonus) Xóa ảnh trên Cloudinary
        if (book.cover_image) {
            try {
                const urlParts = book.cover_image.split('/');
                const publicIdWithExt = urlParts[urlParts.length - 1];
                const publicId = publicIdWithExt.split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (err) {
                console.log('Không xóa được ảnh:', err.message);
            }
        }

        // Xóa record (cascade sẽ tự xóa reviews, cart items, etc.)
        await book.destroy();

        res.success(null, 'Xóa sách thành công');

    } catch (err) {
        console.error('Delete book error:', err);
        res.error('Lỗi xóa sách', 500);
    }
};

// === LẤY TẤT CẢ SÁCH (CÓ PHÂN TRANG) ===
const getAllBooksSystem = async (req, res) => {
    try {
        // 1. Lấy tham số từ Query String (URL)
        // Mặc định: trang 1, 20 sách/trang nếu không gửi lên
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        // 2. Query DB với phân trang
        const { count, rows } = await Book.findAndCountAll({
            // Giới hạn số lượng và vị trí bắt đầu
            limit: limit,
            offset: offset,

            // Sắp xếp: Sách mới nhất lên đầu
            order: [['book_id', 'DESC']],

            // Lấy đầy đủ thông tin liên quan
            include: [
                {
                    model: Publisher,
                    attributes: ['publisher_id', 'name']
                },
                {
                    model: Author,
                    attributes: ['author_id', 'name'],
                    through: { attributes: [] }
                },
                {
                    model: Genre,
                    attributes: ['genre_id', 'name'],
                    through: { attributes: [] }
                }
            ],
            // distinct: true là quan trọng khi dùng include để đếm chính xác số lượng sách (tránh bị nhân đôi do join)
            distinct: true
        });

        // 3. Trả về kết quả kèm Metadata phân trang
        res.success({
            books: rows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                pageSize: limit
            }
        }, 'Lấy danh sách sách thành công');

    } catch (err) {
        console.error('Get all books system error:', err);
        res.error('Lỗi server khi lấy danh sách sách', 500);
    }
};

export default {
    uploadCover, addBook, updateBook, deleteBook, getBooks, getNewReleases, getTopRatedBooks, getBookById,
    getAllBooksSystem
};