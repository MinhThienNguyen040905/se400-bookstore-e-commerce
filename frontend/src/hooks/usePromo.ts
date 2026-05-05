// src/hooks/usePromo.ts
import { useMutation } from '@tanstack/react-query';
import { checkPromoCode, type PromoCheckBody, type PromoResponse } from '@/api/orderApi';
import { showToast } from '@/lib/toast';

export const useCheckPromo = () => {
    return useMutation<PromoResponse, Error, PromoCheckBody>({
        mutationFn: checkPromoCode,
        onSuccess: (data) => {
            showToast.success(data.message || 'Áp dụng mã thành công!');
        },
        onError: (err: any) => {
            showToast.error(err.response?.data?.message || 'Mã khuyến mãi không hợp lệ');
        },
    });
};