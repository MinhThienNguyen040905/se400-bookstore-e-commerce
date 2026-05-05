// src/hooks/useVNPayPayment.ts
import { useMutation } from '@tanstack/react-query';
import { createVNPayPaymentUrl, type CreatePaymentUrlBody } from '@/api/paymentApi';
import { showToast } from '@/lib/toast';

export const useVNPayPayment = () => {
    return useMutation({
        mutationFn: (body: CreatePaymentUrlBody) => createVNPayPaymentUrl(body),
        onSuccess: (data) => {
            // Redirect đến VNPay payment page
            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else {
                showToast.error('Không nhận được URL thanh toán');
            }
        },
        onError: (error: any) => {
            console.error('Lỗi tạo URL thanh toán VNPay:', error);
            showToast.error(error?.response?.data?.message || 'Không thể tạo URL thanh toán');
        }
    });
};