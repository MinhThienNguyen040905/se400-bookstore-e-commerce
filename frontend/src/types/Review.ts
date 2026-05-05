import type { CommentUser } from "./User";

export interface Review {
    review_id: number;
    rating: number;
    comment: string;
    review_date: string;
    user: CommentUser
}