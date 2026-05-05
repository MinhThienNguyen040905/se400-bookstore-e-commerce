// src/api/cartApi.ts
import api from './axios';
import type { CartItem } from '@/features/cart/useCartStore';

export interface AddToCartBody {
    book_id: number;
    quantity?: number;
}

export interface UpdateCartBody {
    book_id: number;
    quantity: number;
}

export interface CartResponse {
    items: CartItem[];
    total_items: number;
    total_price: number;
}

// GET: Lấy giỏ hàng
export const getCart = async (): Promise<CartResponse> => {
    const { data } = await api.get('/cart');
    return data; // nhờ interceptor → đã là data thật
};

// POST: Thêm vào giỏ
export const addToCartApi = async (body: AddToCartBody) => {
    const { data } = await api.post('/cart', body);
    return data;
};

// PUT: Cập nhật số lượng
export const updateCartApi = async (body: UpdateCartBody) => {
    const { data } = await api.put('/cart', body);
    return data;
};

// DELETE: Xóa sách khỏi giỏ
export const removeFromCartApi = async (book_id: number) => {
    const { data } = await api.delete(`/cart/${book_id}`);
    return data;
};