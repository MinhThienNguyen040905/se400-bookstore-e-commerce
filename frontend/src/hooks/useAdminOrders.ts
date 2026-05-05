// src/hooks/useAdminOrders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import { showToast } from '@/lib/toast';

// --- TYPES ---
export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
    book_id: number;
    quantity: number;
    price: number;
    Book: {
        title: string;
        cover_image: string;
    };
}

export interface AdminOrder {
    order_id: number;
    total_price: number;
    status: OrderStatus;
    order_date: string;
    payment_method: string;
    address: string;
    phone: string;
    User: {
        user_id: number;
        name: string;
        email: string;
    };
    OrderItems: OrderItem[];
}

interface OrdersResponse {
    orders: AdminOrder[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
    };
}

// --- TYPE CHO CHI TIẾT ĐƠN HÀNG (Khớp với Controller trả về) ---
export interface OrderDetailType {
    order_id: number;
    status: OrderStatus;
    total_price: number;
    payment_method: string;
    address: string;
    phone: string;
    order_date: string;
    user: {
        user_id: number;
        name: string;
        email: string;
        phone: string;
        address: string;
    };
    promo: {
        code: string;
        discount_percent: number;
        min_amount: number;
    } | null;
    items: Array<{
        order_item_id: number;
        quantity: number;
        price: number;
        book: {
            book_id: number;
            title: string;
            cover_image: string;
            price: number;
        };
    }>;
    status_history?: Array<{ // Timeline nếu backend có trả về
        status: string;
        title: string;
        description: string;
        completedAt: string;
        isCompleted: boolean;
    }>;
}

// --- API CALLS ---

const getOrders = async (page: number, limit: number): Promise<OrdersResponse> => {
    const { data } = await api.get('/orders/all', { params: { page, limit } });
    return data;
};

const updateStatusApi = async ({ order_id, status }: { order_id: number; status: string }) => {
    const { data } = await api.put('/orders/order-status', { order_id, status });
    return data;
};

const getOrderByIdApi = async (id: number): Promise<OrderDetailType> => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
};

// --- HOOKS ---

export const useAdminOrders = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: ['admin-orders', page, limit],
        queryFn: () => getOrders(page, limit),
        staleTime: 1000 * 60, // 1 phút
    });
};

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateStatusApi,
        onMutate: () => {
            const toastId = showToast.loading('Updating status...');
            return { toastId };
        },
        onSuccess: (_, variables, context) => {
            // Invalidate query để load lại danh sách mới
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });

            showToast.dismiss(context?.toastId);
            showToast.success(`Order #${variables.order_id} updated successfully`);
        },
        onError: (err: any, _, context) => {
            showToast.dismiss(context?.toastId);
            showToast.error(err.response?.data?.message || 'Failed to update status');
        },
    });
};

// Hook mới: Lấy chi tiết đơn hàng
export const useAdminOrderDetail = (orderId: number | null) => {
    return useQuery({
        queryKey: ['admin-order-detail', orderId],
        queryFn: () => getOrderByIdApi(orderId!), // Dấu ! vì enabled đã check null
        enabled: !!orderId, // Chỉ gọi API khi có orderId (tức là khi mở Modal)
        staleTime: 1000 * 60 * 5, // Cache 5 phút
    });
};