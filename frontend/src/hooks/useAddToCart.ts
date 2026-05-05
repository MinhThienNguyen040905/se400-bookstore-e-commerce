// src/hooks/useAddToCart.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { addToCartApi } from '@/api/cartApi';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useCartStore } from '@/features/cart/useCartStore';
import { showToast } from '@/lib/toast';
import type { CardBook } from '@/types/book';

interface AddToCartVariables {
    book: CardBook;
    quantity?: number;
}

export const useAddToCart = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const addToCartLocal = useCartStore((state) => state.addToCart);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ book, quantity = 1 }: AddToCartVariables) => {
            if (!user) {
                navigate('/login', { state: { from: location.pathname } });
                return Promise.reject(new Error('Chưa đăng nhập'));
            }
            // Gửi quantity xuống API
            return addToCartApi({ book_id: book.book_id, quantity });
        },
        // Dùng onMutate để lấy được book
        onMutate: async ({ book, quantity = 1 }) => {
            // Cập nhật store local ngay lập tức với số lượng đúng
            addToCartLocal(book, quantity);
            return { book };
        },

        onSuccess: () => {
            // Refetch để đồng bộ chính xác với backend
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            showToast.success('Đã thêm vào giỏ hàng');
        },

        onError: (err: any) => {
            showToast.error(err.message || 'Thêm vào giỏ thất bại');
        }
    });
};