import AppError from '../errors/AppError.js';
import Review from '../models/Review.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import { ORDER_STATUS } from '../constants/orderStatus.js';
import reviewRepository from '../repositories/reviewRepository.js';
import reviewAnalysisService from './ai/reviewAnalysisService.js';
import bookInsightService from './ai/bookInsightService.js';

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

    const review = await Review.create({
        user_id: userId,
        book_id: bookId,
        rating,
        comment
    });

    await bookInsightService.invalidateBookInsights(bookId);
    reviewAnalysisService.queueReviewAnalysis(review.review_id);

    return review;
};

const getReviewsByBook = async ({ bookId }) => reviewRepository.findReviewsByBook(bookId);

const getAllReviews = async () => reviewRepository.findAllReviews();

export default { addReview, getReviewsByBook, getAllReviews };
