import type { CommentUser } from "./User";

export type SentimentLabel = 'positive' | 'neutral' | 'negative';
export type AspectLabel = 'positive' | 'neutral' | 'negative' | 'none';

export interface ReviewAspects {
    content_quality?: AspectLabel;
    translation?: AspectLabel;
    print_quality?: AspectLabel;
    shipping?: AspectLabel;
    price_value?: AspectLabel;
}

export interface EnsembleSources {
    groq?: SentimentLabel | null;
    rule?: SentimentLabel | null;
    rating?: SentimentLabel | null;
}

export interface Review {
    review_id: number;
    rating: number;
    comment: string;
    review_date: string;
    user: CommentUser;
    analysis?: ReviewAnalysis | null;
}

export interface ReviewAnalysis {
    sentiment_label: SentimentLabel;
    sentiment_score: number;
    confidence: number;
    summary?: string;
    signals?: string[];
    spam_risk?: 'low' | 'medium' | 'high';
    spam_reasons?: string[];
    provider?: string;
    model?: string | null;
    aspects?: ReviewAspects | null;
    ensemble_agreement?: number | null;
    ensemble_sources?: EnsembleSources | null;
}
