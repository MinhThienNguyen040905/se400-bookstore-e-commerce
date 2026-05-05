// src/api/reviewApi.ts
import api from './axios';

export interface CreateReviewBody {
    book_id: number;
    rating: number;
    comment: string;
}

export const createReview = async (body: CreateReviewBody) => {
    // Sửa: Đừng destructure { data } ngay, hãy lấy response gốc
    const response = await api.post('/reviews', body);

    // Nếu axios interceptor của bạn đã trả về response.data, thì dòng này trả về data luôn
    // Nếu axios trả về full response object, thì lấy response.data
    return response.data || response;
};

export const getBookReviews = async (book_id: number) => {
    const { data } = await api.get(`/reviews/book/${book_id}`);
    return data;
};

