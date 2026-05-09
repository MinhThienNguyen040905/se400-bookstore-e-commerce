// src/types/book.ts
import type { Genre } from "./Genre";
import type { Review } from "./Review";

export interface Book {
    book_id: number;
    title: string;
    description: string;
    price: number;
    stock: number;
    cover_image: string;
    release_date: string;
    isbn: string;
    publisher: string;
    authors: string;
    genres: Genre[];
    avg_rating: number;
    reviews: Review[];
    is_in_wishlist: boolean; // <--- Trường mới
}

export interface CardBook {
    book_id: number;
    title: string;
    authors: string;
    price: number;
    cover_image: string;
    avg_rating?: number;
    genres?: string;
}

export interface BookInsight {
    book_id: number;
    summary: string;
    positive_points: string[];
    negative_points: string[];
    reader_fit: string;
    recommendation_hint: string;
    sentiment_distribution: {
        positive: number;
        neutral: number;
        negative: number;
    };
    review_count: number;
    provider: string;
    generated_at?: string;
}
