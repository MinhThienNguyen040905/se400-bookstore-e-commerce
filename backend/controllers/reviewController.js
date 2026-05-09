import reviewService from '../services/reviewService.js';

const addReview = async (req, res) => {
    const review = await reviewService.addReview({
        userId: req.user.user_id,
        bookId: req.body.book_id,
        rating: req.body.rating,
        comment: req.body.comment
    });

    return res.status(201).json({
        success: true,
        message: 'Danh gia thanh cong',
        data: review
    });
};

const getReviewsByBook = async (req, res) => {
    const reviews = await reviewService.getReviewsByBook({ bookId: req.params.book_id });
    res.success(reviews, 'Lay danh sach danh gia thanh cong');
};

const getAllReviews = async (req, res) => {
    const reviews = await reviewService.getAllReviews();
    res.success(reviews, 'Lay danh sach danh gia thanh cong');
};

const reanalyzeReview = async (req, res) => {
    const reviewId = Number(req.params.id);
    if (!Number.isFinite(reviewId) || reviewId <= 0) {
        return res.status(400).json({ success: false, message: 'review_id khong hop le' });
    }

    const analysis = await reviewService.reanalyzeReview({ reviewId });
    res.success({
        review_id: reviewId,
        sentiment_label: analysis.sentiment_label,
        sentiment_score: analysis.sentiment_score,
        confidence: analysis.confidence,
        provider: analysis.provider,
        ensemble_agreement: analysis.ensemble_agreement
    }, 'Phan tich lai review thanh cong');
};

export default { addReview, getReviewsByBook, getAllReviews, reanalyzeReview };
