// src/api/wishlistApi.ts
import api from './axios';
import type { WishlistItem } from '@/types/wishlist';

// API Toggle (Đã có từ trước - nhắc lại để import)
export const toggleWishlistApi = async (book_id: number) => {
    const { data } = await api.post('/wishlist/toggle', { book_id });
    return data;
};

// API Get Wishlist (Mới)
export const getWishlistApi = async (): Promise<WishlistItem[]> => {
    const { data } = await api.get('/wishlist');
    return data; // Backend trả về mảng result trực tiếp hoặc data.data tùy cấu hình interceptor
};