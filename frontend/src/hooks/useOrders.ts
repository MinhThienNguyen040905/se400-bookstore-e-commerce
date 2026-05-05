import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyOrders, cancelOrderApi } from '@/api/orderApi';
import { showToast } from '@/lib/toast';

export const useMyOrders = () => {
    return useQuery({
        queryKey: ['my-orders'],
        queryFn: getMyOrders,
        staleTime: 1000 * 60 * 5, // Cache 5 phút
    });
};

export const useCancelOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cancelOrderApi,
        onMutate: () => {
            return { toastId: showToast.loading('Cancelling order...') };
        },
        onSuccess: (data, variables, context) => {
            // Làm mới danh sách đơn hàng ngay lập tức
            queryClient.invalidateQueries({ queryKey: ['my-orders'] });

            showToast.dismiss(context?.toastId);
            showToast.success('Order cancelled successfully');
        },
        onError: (err: any, variables, context) => {
            showToast.dismiss(context?.toastId);
            showToast.error(err.response?.data?.message || 'Failed to cancel order');
        },
    });
};