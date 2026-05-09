import type { CardBook } from './book';

export interface RecommendationItem {
    book: CardBook;
    score: number;
    reasons: string[];
    signals: {
        avg_rating: number;
        avg_sentiment: number;
        review_count: number;
        sales_count: number;
        wishlist_count: number;
        interest_match: number;
    };
}
