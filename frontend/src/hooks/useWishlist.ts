// src/hooks/useWishlist.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWishlistApi, toggleWishlistApi } from '@/api/wishlistApi';
import { showToast } from '@/lib/toast';

export const useWishlist = () => {
    return useQuery({
        queryKey: ['wishlist'],
        queryFn: getWishlistApi,
        staleTime: 1000 * 60 * 5, // Cache 5 phút
    });
};

export const useRemoveFromWishlist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: toggleWishlistApi,
        onMutate: () => {
            // Có thể thêm loading toast nếu muốn
        },
        onSuccess: (data) => {
            // Sau khi xóa thành công, làm mới danh sách wishlist ngay lập tức
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
            // Cũng nên làm mới query 'book' để cập nhật trạng thái trái tim ở trang chi tiết nếu người dùng quay lại đó
            queryClient.invalidateQueries({ queryKey: ['book'] });

            showToast.success('Đã xóa khỏi danh sách yêu thích');
        },
        onError: (err: any) => {
            showToast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    });
};