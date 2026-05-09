// src/hooks/useAdmin.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import { showToast } from '@/lib/toast'; // <--- ĐÃ SỬA ĐÚNG
import type { DashboardStats } from '@/types/admin';

// --- TYPES ---
export interface User {
    user_id: number;
    name: string;
    email: string;
    role: 'admin' | 'customer';
    phone: string;
    address: string;
    avatar: string | null;
}

export interface AdminAiInsights {
    negative_review_books: Array<{
        book_id: number;
        title: string;
        cover_image: string;
        analyzed_reviews: number;
        negative_reviews: number;
        avg_sentiment: number;
    }>;
    top_positive_genres: Array<{
        genre_id: number;
        name: string;
        analyzed_reviews: number;
        avg_sentiment: number;
    }>;
    suspicious_reviews: Array<{
        review_id: number;
        rating: number;
        comment: string;
        spam_risk: 'medium' | 'high';
        spam_reasons: string[];
        sentiment_label: string;
        sentiment_score: number;
        user: { user_id: number; name: string } | null;
        book: { book_id: number; title: string } | null;
    }>;
}

// --- API CALLS ---
const getAdminStats = async (): Promise<DashboardStats> => {
    const { data } = await api.get('/admin/stats');
    return data;
};

const getAdminAiInsights = async (): Promise<AdminAiInsights> => {
    const { data } = await api.get('/admin/stats/ai-insights');
    return data;
};

const getUsers = async (): Promise<User[]> => {
    const { data } = await api.get('/users');
    return data;
};

const deleteUserApi = async (id: number) => {
    const { data } = await api.delete('/users/delete', { data: { id } });
    return data;
};

// --- HOOKS ---

// 1. Hook lấy thống kê Dashboard
export const useAdminStats = () => {
    return useQuery({
        queryKey: ['admin-stats'],
        queryFn: getAdminStats,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
};

export const useAdminAiInsights = () => {
    return useQuery({
        queryKey: ['admin-ai-insights'],
        queryFn: getAdminAiInsights,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
};

// 2. Hook lấy danh sách User
export const useAdminUsers = () => {
    return useQuery({
        queryKey: ['admin-users'],
        queryFn: getUsers,
        staleTime: 1000 * 60 * 5,
    });
};

// 3. Hook Xóa User
export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteUserApi,
        onMutate: () => {
            // showToast.loading trả về ID để dismiss sau này
            const toastId = showToast.loading('Deleting user...');
            return { toastId };
        },
        onSuccess: (_data, _variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            showToast.dismiss(context?.toastId);
            showToast.success('User deleted successfully');
        },
        onError: (err: unknown, _variables, context) => {
            const error = err as { response?: { data?: { message?: string } } };
            showToast.dismiss(context?.toastId);
            showToast.error(error.response?.data?.message || 'Failed to delete user');
        },
    });
};
