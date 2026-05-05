// src/api/orderApi.ts
import api from './axios';
import type { Order } from '@/types/order';

export interface PromoCheckBody {
    code: string;
    total_price: number;
}

export interface PromoResponse {
    code: string;
    discount_percent: number;
    discount_amount: number;
    min_amount: number;
    expiry_date: string;
    final_price: number;
    message: string;
}

export interface CreateOrderBody {
    promo_code?: string;
    payment_method: 'COD' | 'VNPay' | 'paypal' | 'cash_on_delivery' | 'credit_card';
    address: string;
    phone: string;
}

export interface OrderResponse {
    order_id: number;
    total_price: number;
    status: string;
    payment_method: string;
    address: string;
    phone: string;
    PromoCode?: { code: string; discount_percent: number } | null;
    OrderItems: Array<{
        book_id: number;
        quantity: number;
        price: number;
        Book: {
            title: string;
            cover_image: string;
        };
    }>;
}

export const checkPromoCode = async (body: PromoCheckBody) => {
    const { data } = await api.post<PromoResponse>('/promos/by-code', body);
    return data; // { success: true, data: PromoResponse }
};

export const createOrder = async (body: CreateOrderBody) => {
    const { data } = await api.post('/orders', body);
    return data;
};

export const getMyOrders = async (): Promise<Order[]> => {
    const { data } = await api.get('/orders/my-orders');
    return data; // Backend trả về data: [Order...]
};

// Thêm hàm hủy đơn hàng
export const cancelOrderApi = async (order_id: number) => {
    const { data } = await api.put('/orders/cancel', { order_id });
    return data;
};