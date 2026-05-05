import api from './axios';

export interface CreatePaymentUrlBody {
    amount: number;
    address: string;
    phone: string;
    promo_code?: string;
}

export interface CreatePaymentUrlResponse {
    paymentUrl: string;
}

/**
 * Tạo URL thanh toán VNPay
 */
export const createVNPayPaymentUrl = async (body: CreatePaymentUrlBody) => {
    // Interceptor đã xử lý trả về data nằm trong response.data
    const { data } = await api.post<{ success: boolean; data: CreatePaymentUrlResponse }>('/payment/create_payment_url', body);

    // SỬA LẠI: Trả về data trực tiếp, không gọi data.data nữa
    return data;
};