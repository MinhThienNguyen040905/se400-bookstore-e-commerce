import reviewRepository from '../../repositories/reviewRepository.js';
import { createJsonCompletion, isAiEnabled, isGroqConfigured } from './groqClient.js';
import { clampNumber } from './jsonParser.js';
import { fallbackAnalyzeReview } from './fallbackSentiment.js';
import { sanitizePii, normalizeText } from './sanitize.js';
import { ensembleVote, ensembleScore } from './ensembleVote.js';

const PROMPT_VERSION = 'review-sentiment-v2-ensemble-aspects';

const ASPECT_KEYS = ['content_quality', 'translation', 'print_quality', 'shipping', 'price_value'];

const maxReviewChars = () => {
    const value = Number(process.env.AI_MAX_REVIEW_CHARS);
    return Number.isFinite(value) && value > 0 ? value : 2000;
};

const normalizeLabel = (value) => {
    if (['positive', 'neutral', 'negative'].includes(value)) return value;
    return 'neutral';
};

const normalizeAspectLabel = (value) => {
    if (['positive', 'neutral', 'negative', 'none'].includes(value)) return value;
    return 'none';
};

const normalizeSpamRisk = (value) => {
    if (['low', 'medium', 'high'].includes(value)) return value;
    return 'low';
};

const normalizeStringArray = (value) => {
    if (!Array.isArray(value)) return [];
    return value
        .filter((item) => typeof item === 'string' && item.trim())
        .map((item) => item.trim())
        .slice(0, 5);
};

const normalizeAspects = (value) => {
    const result = {};
    if (value && typeof value === 'object') {
        ASPECT_KEYS.forEach((key) => {
            result[key] = normalizeAspectLabel(value[key]);
        });
    } else {
        ASPECT_KEYS.forEach((key) => { result[key] = 'none'; });
    }
    return result;
};

const normalizeAnalysis = (payload) => ({
    sentiment_label: normalizeLabel(payload.sentiment_label),
    sentiment_score: Number(clampNumber(payload.sentiment_score, -1, 1, 0).toFixed(4)),
    confidence: Number(clampNumber(payload.confidence, 0, 1, 0.5).toFixed(4)),
    short_summary: typeof payload.short_summary === 'string' ? payload.short_summary.slice(0, 1000) : '',
    signals: normalizeStringArray(payload.signals),
    spam_risk: normalizeSpamRisk(payload.spam_risk),
    spam_reasons: normalizeStringArray(payload.spam_reasons),
    aspects: normalizeAspects(payload.aspects)
});

const buildPrompt = ({ rating, comment, bookTitle }) => `You are analyzing a Vietnamese bookstore product review.
Language: Vietnamese (may include teencode, slang, regional words, mixed English).
Interpret accordingly. Negation words (khong, chua, chang, "khong tot", "chua hay") flip sentiment.
Return only valid JSON. All string values must be in Vietnamese.

Input:
book_title: ${bookTitle || 'Unknown'}
rating: ${rating}
comment: ${comment || ''}

Task:
1. Classify overall sentiment as positive, neutral, or negative based on the comment text.
2. Give sentiment_score in [-1, 1].
3. Give confidence in [0, 1] reflecting how clear the sentiment is.
4. Summarize the review in 1 short Vietnamese sentence.
5. Extract up to 5 short Vietnamese signals (key praise/complaint phrases).
6. Detect spam risk (low/medium/high) and reasons.
7. For each aspect below, classify as positive | neutral | negative | none (use "none" if the aspect is not mentioned).

Aspect keys (return exactly these keys):
- content_quality: noi dung sach
- translation: chat luong dich (chi danh cho sach dich)
- print_quality: chat luong in / giay / bia
- shipping: giao hang / dong goi
- price_value: gia tri so voi gia tien

JSON schema:
{
  "sentiment_label": "positive|neutral|negative",
  "sentiment_score": number,
  "confidence": number,
  "short_summary": string,
  "signals": string[],
  "spam_risk": "low|medium|high",
  "spam_reasons": string[],
  "aspects": {
    "content_quality": "positive|neutral|negative|none",
    "translation": "positive|neutral|negative|none",
    "print_quality": "positive|neutral|negative|none",
    "shipping": "positive|neutral|negative|none",
    "price_value": "positive|neutral|negative|none"
  }
}`;

const analyzeWithGroq = async ({ rating, sanitizedComment, sanitizedTitle }) => {
    const completion = await createJsonCompletion({
        prompt: buildPrompt({ rating, comment: sanitizedComment, bookTitle: sanitizedTitle }),
        model: process.env.GROQ_MODEL_FAST || 'llama-3.1-8b-instant'
    });

    return {
        ...normalizeAnalysis(completion.data),
        provider: completion.provider,
        model: completion.model,
        rawMeta: {
            usage: completion.rawResponse?.usage || null,
            finish_reason: completion.rawResponse?.choices?.[0]?.finish_reason || null
        }
    };
};

const analyzeReview = async (review) => {
    const rawComment = review.comment || '';
    const sanitizedComment = normalizeText(sanitizePii(rawComment)).slice(0, maxReviewChars());
    const sanitizedTitle = normalizeText(sanitizePii(review.Book?.title || ''));

    const ruleAnalysis = fallbackAnalyzeReview({ rating: review.rating, comment: rawComment });

    let groqAnalysis = null;
    if (isAiEnabled() && isGroqConfigured()) {
        try {
            groqAnalysis = await analyzeWithGroq({
                rating: review.rating,
                sanitizedComment,
                sanitizedTitle
            });
        } catch (err) {
            console.warn(`Groq review analysis failed for review ${review.review_id}:`, err.message);
        }
    }

    const primary = groqAnalysis || ruleAnalysis;
    const ensemble = ensembleVote({
        groq: groqAnalysis,
        rule: ruleAnalysis,
        rating: review.rating
    });
    const blendedScore = ensembleScore({
        groq: groqAnalysis,
        rule: ruleAnalysis,
        rating: review.rating
    });

    const provider = groqAnalysis ? `${groqAnalysis.provider}+ensemble` : 'fallback+ensemble';

    return {
        sentiment_label: ensemble.label,
        sentiment_score: blendedScore,
        confidence: Number(((primary.confidence || 0.5) * 0.5 + ensemble.agreement * 0.5).toFixed(4)),
        short_summary: primary.short_summary,
        signals: primary.signals,
        spam_risk: primary.spam_risk,
        spam_reasons: primary.spam_reasons,
        aspects: groqAnalysis?.aspects || normalizeAspects(),
        provider,
        model: groqAnalysis?.model || null,
        prompt_version: PROMPT_VERSION,
        raw_response: groqAnalysis?.rawMeta || null,
        ensemble_agreement: ensemble.agreement,
        ensemble_sources: ensemble.sources
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
