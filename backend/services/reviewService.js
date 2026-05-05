import AppError from '../errors/AppError.js';
import Review from '../models/Review.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import { ORDER_STATUS } from '../constants/orderStatus.js';

const addReview = async ({ userId, bookId, rating, comment }) => {
    const book = await Book.findByPk(bookId);
    if (!book) throw new AppError('Book not found', 404);

    const user = await User.findByPk(userId);
    if (!user) throw new AppError('User not found', 404);

    const existingReview = await Review.findOne({ where: { user_id: userId, book_id: bookId } });
    if (existingReview) {
        throw new AppError('You have already reviewed this book', 400);
    }

    const deliveredOrder = await Order.findOne({
        where: {
            user_id: userId,
            status: ORDER_STATUS.DELIVERED
        },
        include: [{
            model: OrderItem,
            where: { book_id: bookId },
            required: true
        }]
    });

    if (!deliveredOrder) {
        throw new AppError('Ban chi co the danh gia sach sau khi don hang da duoc giao thanh cong', 403);
    }

    return Review.create({
        user_id: userId,
        book_id: bookId,
        rating,
        comment
    });
};

const getReviewsByBook = async ({ bookId }) => Review.findAll({
    where: { book_id: bookId },
    include: [{ model: User, attributes: ['user_id', 'name'] }]
});

const getAllReviews = async () => Review.findAll({
    include: [
        { model: User, attributes: ['user_id', 'name'] },
        { model: Book, attributes: ['book_id', 'title'] }
    ]
});

export default { addReview, getReviewsByBook, getAllReviews };
