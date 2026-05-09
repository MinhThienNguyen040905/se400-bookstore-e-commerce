import reviewRepository from '../../repositories/reviewRepository.js';
import { createJsonCompletion, isAiEnabled, isGroqConfigured } from './groqClient.js';
import { clampNumber } from './jsonParser.js';
import { fallbackAnalyzeReview } from './fallbackSentiment.js';
import { sanitizePii } from './sanitize.js';

const PROMPT_VERSION = 'review-sentiment-v1';

const maxReviewChars = () => {
    const value = Number(process.env.AI_MAX_REVIEW_CHARS);
    return Number.isFinite(value) && value > 0 ? value : 2000;
};

const normalizeLabel = (value) => {
    if (['positive', 'neutral', 'negative'].includes(value)) {
        return value;
    }
    return 'neutral';
};

const normalizeSpamRisk = (value) => {
    if (['low', 'medium', 'high'].includes(value)) {
        return value;
    }
    return 'low';
};

const normalizeStringArray = (value) => {
    if (!Array.isArray(value)) return [];
    return value
        .filter((item) => typeof item === 'string' && item.trim())
        .map((item) => item.trim())
        .slice(0, 5);
};

const normalizeAnalysis = (payload) => ({
    sentiment_label: normalizeLabel(payload.sentiment_label),
    sentiment_score: Number(clampNumber(payload.sentiment_score, -1, 1, 0).toFixed(4)),
    confidence: Number(clampNumber(payload.confidence, 0, 1, 0.5).toFixed(4)),
    short_summary: typeof payload.short_summary === 'string' ? payload.short_summary.slice(0, 1000) : '',
    signals: normalizeStringArray(payload.signals),
    spam_risk: normalizeSpamRisk(payload.spam_risk),
    spam_reasons: normalizeStringArray(payload.spam_reasons)
});

const buildPrompt = ({ rating, comment, bookTitle }) => `You are analyzing a bookstore product review written by a customer.
Return only valid JSON in Vietnamese.

Input:
book_title: ${bookTitle || 'Unknown'}
rating: ${rating}
comment: ${comment || ''}

Task:
- Classify sentiment as positive, neutral, or negative.
- Give sentiment_score from -1 to 1.
- Give confidence from 0 to 1.
- Summarize the review in Vietnamese.
- Extract up to 5 short signals.
- Detect spam risk.

JSON schema:
{
  "sentiment_label": "positive|neutral|negative",
  "sentiment_score": number,
  "confidence": number,
  "short_summary": string,
  "signals": string[],
  "spam_risk": "low|medium|high",
  "spam_reasons": string[]
}`;

const analyzeWithGroq = async (review) => {
    const sanitizedComment = sanitizePii(review.comment || '').slice(0, maxReviewChars());
    const sanitizedTitle = sanitizePii(review.Book?.title || '');
    const completion = await createJsonCompletion({
        prompt: buildPrompt({
            rating: review.rating,
            comment: sanitizedComment,
            bookTitle: sanitizedTitle
        }),
        model: process.env.GROQ_MODEL_FAST || 'llama-3.1-8b-instant'
    });

    return {
        ...normalizeAnalysis(completion.data),
        provider: completion.provider,
        model: completion.model,
        prompt_version: PROMPT_VERSION,
        raw_response: {
            usage: completion.rawResponse?.usage || null,
            finish_reason: completion.rawResponse?.choices?.[0]?.finish_reason || null
        }
    };
};

const analyzeReview = async (review) => {
    if (isAiEnabled() && isGroqConfigured()) {
        try {
            return await analyzeWithGroq(review);
        } catch (err) {
            console.warn(`Groq review analysis failed for review ${review.review_id}:`, err.message);
        }
    }

    return {
        ...fallbackAnalyzeReview({ rating: review.rating, comment: review.comment }),
        provider: 'fallback',
        model: null,
        prompt_version: PROMPT_VERSION,
        raw_response: null
    };
};

const analyzeAndStoreReview = async (reviewId) => {
    const review = await reviewRepository.findReviewForAnalysis(reviewId);
    if (!review) return null;

    const analysis = await analyzeReview(review);
    return reviewRepository.upsertReviewAnalysis({ reviewId, analysis });
};

const queueReviewAnalysis = (reviewId) => {
    setTimeout(() => {
        analyzeAndStoreReview(reviewId).catch((err) => {
            console.warn(`Review analysis job failed for review ${reviewId}:`, err.message);
        });
    }, 0);
};

export default {
    analyzeAndStoreReview,
    queueReviewAnalysis
};
