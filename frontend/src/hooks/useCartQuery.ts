// src/hooks/useCartQuery.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getCart } from '@/api/cartApi';
import { useCartStore } from '@/features/cart/useCartStore';
import { useAuthStore } from '@/features/auth/useAuthStore';

export const useCartQuery = () => {
    const { user } = useAuthStore();
    const setItems = useCartStore((state) => state.setItems);
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['cart'],
        queryFn: getCart,
        enabled: !!user,
        staleTime: 1000 * 60, // 1 phút
        // Bỏ hoàn toàn onSuccess ở đây
    });

    // Thay thế onSuccess bằng useEffect
    useEffect(() => {
        if (query.data) {
            const normalizedItems = query.data.items.map((item: any) => ({
                book_id: item.book_id,
                title: item.title,
                authors: item.authors || 'Không rõ tác giả', // ← thêm fallback!
                price: Number(item.price),
                cover_image: item.cover,
                quantity: item.quantity,
                stock: item.stock || 999,
            }));

            console.log('Sync cart từ backend:', normalizedItems);
            setItems(normalizedItems);
        }
    }, [query.data, setItems]);
    // Khi đăng xuất → xóa cart
    useEffect(() => {
        if (!user) {
            setItems([]);
            queryClient.removeQueries({ queryKey: ['cart'] });
        }
    }, [user, setItems, queryClient]);

    return query;
};