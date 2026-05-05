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

// --- API CALLS ---
const getAdminStats = async (): Promise<DashboardStats> => {
    const { data } = await api.get('/admin/stats');
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
        onError: (err: any, _variables, context) => {
            showToast.dismiss(context?.toastId);
            showToast.error(err.response?.data?.message || 'Failed to delete user');
        },
    });
};