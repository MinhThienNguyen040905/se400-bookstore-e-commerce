import { Op } from 'sequelize';
import Review from '../models/Review.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import { ORDER_STATUS } from '../constants/orderStatus.js';

// Thêm đánh giá
const addReview = async (req, res) => {
    const { book_id, rating, comment } = req.body;
    try {
        // Kiểm tra sách và user
        const book = await Book.findByPk(book_id);
        if (!book) return res.status(404).json({ msg: 'Book not found' });
        const user = await User.findByPk(req.user.user_id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Kiểm tra đã đánh giá chưa
        const existingReview = await Review.findOne({ where: { user_id: req.user.user_id, book_id } });
        if (existingReview) return res.status(400).json({ msg: 'You have already reviewed this book' });

        // ===== VERIFIED REVIEWS LOGIC =====
        // Kiểm tra xem user có đơn hàng nào chứa sách này với trạng thái 'delivered' không
        const deliveredOrder = await Order.findOne({
            where: {
                user_id: req.user.user_id,
                status: ORDER_STATUS.DELIVERED
            },
            include: [{
                model: OrderItem,
                where: { book_id },
                required: true
            }]
        });

        if (!deliveredOrder) {
            return res.status(403).json({
                msg: 'Bạn chỉ có thể đánh giá sách sau khi đơn hàng đã được giao thành công'
            });
        }
        // ===== END VERIFIED REVIEWS LOGIC =====

        const review = await Review.create({
            user_id: req.user.user_id,
            book_id,
            rating,
            comment,
        });
        return res.status(201).json({
            success: true,
            message: 'Đánh giá thành công',
            data: review
        });
    } catch (err) {
        console.error("Add Review Error:", err); // Log để debug server
        // SỬA: Đổi 'err' thành 'message' để frontend bắt được
        return res.status(500).json({
            success: false,
            message: err.message || 'Lỗi server khi lưu đánh giá'
        });
    }
};

// Lấy đánh giá theo sách
const getReviewsByBook = async (req, res) => {
    const { book_id } = req.params;
    try {
        const reviews = await Review.findAll({
            where: { book_id },
            include: [{ model: User, attributes: ['user_id', 'name'] }],
        });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
};

// Lấy tất cả đánh giá (admin)
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [
                { model: User, attributes: ['user_id', 'name'] },
                { model: Book, attributes: ['book_id', 'title'] },
            ],
        });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
};

export default { addReview, getReviewsByBook, getAllReviews };