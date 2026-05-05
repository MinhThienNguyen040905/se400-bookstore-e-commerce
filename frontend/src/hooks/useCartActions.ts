// src/hooks/useCartActions.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCartApi, removeFromCartApi } from '@/api/cartApi';
import { showToast } from '@/lib/toast';

export const useUpdateCart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateCartApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] }); // ← phải có!
            // showToast.success('Cập nhật thành công'); // ← backend đã có message rồi
        },
        onError: (err: any) => {
            showToast.error(err.message || 'Cập nhật số lượng thất bại');
        },
    });
};

export const useRemoveFromCart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removeFromCartApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            // showToast.success('Đã xóa sản phẩm');
        },
        onError: (err: any) => {
            showToast.error(err.message || 'Xóa sản phẩm thất bại');
        },
    });
};