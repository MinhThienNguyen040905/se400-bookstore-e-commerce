import type { CommentUser } from "./User";

export interface Review {
    review_id: number;
    rating: number;
    comment: string;
    review_date: string;
    user: CommentUser;
    analysis?: ReviewAnalysis | null;
}

export interface ReviewAnalysis {
    sentiment_label: 'positive' | 'neutral' | 'negative';
    sentiment_score: number;
    confidence: number;
    summary?: string;
    signals?: string[];
    spam_risk?: 'low' | 'medium' | 'high';
    spam_reasons?: string[];
    provider?: string;
}
