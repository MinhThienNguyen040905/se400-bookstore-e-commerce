// src/hooks/useAdminPromos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import { showToast } from '@/lib/toast';

// --- TYPES ---
export interface PromoCode {
    promo_id: number;
    code: string;
    discount_percent: number;
    min_amount: number;
    expiry_date: string;
    createdAt?: string;
}

interface AllPromosResponse {
    promos: PromoCode[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
    };
}

// --- API CALLS ---

// 1. Lấy TẤT CẢ mã (Có phân trang)
const getAllPromos = async (page: number, limit: number): Promise<AllPromosResponse> => {
    const { data } = await api.get('/promos/all', { params: { page, limit } });
    return data;
};

// 2. Lấy mã CÒN HẠN (Không phân trang)
const getActivePromos = async (): Promise<PromoCode[]> => {
    const { data } = await api.get('/promos');
    return data;
};

// 3. Thêm mã
const addPromoApi = async (promoData: any) => {
    const { data } = await api.post('/promos', promoData);
    return data;
};

// --- HOOKS ---

export const useAllPromos = (page: number, limit: number, enabled: boolean) => {
    return useQuery({
        queryKey: ['admin-promos-all', page, limit],
        queryFn: () => getAllPromos(page, limit),
        enabled: enabled, // Chỉ chạy khi đang chọn tab "All"
        staleTime: 1000 * 60 * 5,
    });
};

export const useActivePromos = (enabled: boolean) => {
    return useQuery({
        queryKey: ['admin-promos-active'],
        queryFn: getActivePromos,
        enabled: enabled, // Chỉ chạy khi đang chọn tab "Active"
        staleTime: 1000 * 60 * 2,
    });
};

export const usePromoMutations = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addPromoApi,
        onSuccess: () => {
            // Làm mới cả 2 danh sách
            queryClient.invalidateQueries({ queryKey: ['admin-promos-all'] });
            queryClient.invalidateQueries({ queryKey: ['admin-promos-active'] });
            showToast.success('Thêm mã khuyến mãi thành công');
        },
        onError: (err: any) => {
            showToast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        },
    });
};