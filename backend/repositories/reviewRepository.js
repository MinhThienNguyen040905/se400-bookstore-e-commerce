import Review from '../models/Review.js';
import ReviewAnalysis from '../models/ReviewAnalysis.js';
import User from '../models/User.js';
import Book from '../models/Book.js';

export const includeReviewAnalysis = {
    model: ReviewAnalysis,
    as: 'analysis',
    required: false,
    attributes: [
        'analysis_id',
        'sentiment_label',
        'sentiment_score',
        'confidence',
        'summary',
        'signals',
        'spam_risk',
        'spam_reasons',
        'aspects',
        'ensemble_agreement',
        'ensemble_sources',
        'provider',
        'model',
        'createdAt'
    ]
};

const findReviewForAnalysis = (reviewId) => Review.findByPk(reviewId, {
    include: [{ model: Book, attributes: ['book_id', 'title'] }]
});

const findReviewsByBook = (bookId) => Review.findAll({
    where: { book_id: bookId },
    include: [
        { model: User, attributes: ['user_id', 'name'] },
        includeReviewAnalysis
    ],
    order: [['review_date', 'DESC']]
});

const findAllReviews = () => Review.findAll({
    include: [
        { model: User, attributes: ['user_id', 'name'] },
        { model: Book, attributes: ['book_id', 'title'] },
        includeReviewAnalysis
    ],
    order: [['review_date', 'DESC']]
});

const upsertReviewAnalysis = async ({ reviewId, analysis }) => {
    const payload = {
        review_id: reviewId,
        sentiment_label: analysis.sentiment_label,
        sentiment_score: analysis.sentiment_score,
        confidence: analysis.confidence,
        summary: analysis.short_summary || analysis.summary,
        signals: analysis.signals || [],
        spam_risk: analysis.spam_risk || 'low',
        spam_reasons: analysis.spam_reasons || [],
        aspects: analysis.aspects || null,
        ensemble_agreement: analysis.ensemble_agreement ?? null,
        ensemble_sources: analysis.ensemble_sources || null,
        provider: analysis.provider || 'fallback',
        model: analysis.model || null,
        prompt_version: analysis.prompt_version || 'review-sentiment-v1',
        raw_response: analysis.raw_response || null
    };

    const existing = await ReviewAnalysis.findOne({ where: { review_id: reviewId } });
    if (existing) {
        await existing.update(payload);
        return existing.reload();
    }

    return ReviewAnalysis.create(payload);
};

export default {
    findReviewForAnalysis,
    findReviewsByBook,
    findAllReviews,
    upsertReviewAnalysis
};
