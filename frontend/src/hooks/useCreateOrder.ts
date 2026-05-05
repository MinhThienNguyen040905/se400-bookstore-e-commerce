// src/hooks/useCreateOrder.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder, type CreateOrderBody } from '@/api/orderApi';
import { showToast } from '@/lib/toast';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/features/cart/useCartStore';

export const useCreateOrder = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const clearCart = useCartStore((s) => s.clearCart);

    return useMutation({
        mutationFn: createOrder,
        onSuccess: (res) => {
            showToast.success(res.message || 'Đặt hàng thành công!');
            clearCart();
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            navigate('/order-success', { state: { order: res.data } });
        },
        onError: (err: any) => {
            showToast.error(err.response?.data?.message || 'Đặt hàng thất bại');
        },
    });
};