// src/hooks/useAdminPublishers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import { showToast } from '@/lib/toast';

// --- TYPES ---
export interface Publisher {
    publisher_id: number;
    name: string;
}

interface PublishersResponse {
    publishers: Publisher[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
    };
}

// --- API CALLS ---
const getPublishers = async (page: number, limit: number): Promise<PublishersResponse> => {
    const { data } = await api.get('/publishers', { params: { page, limit } });
    return data;
};

const addPublisherApi = async (name: string) => {
    const { data } = await api.post('/publishers', { name });
    return data;
};

const updatePublisherApi = async ({ id, name }: { id: number; name: string }) => {
    const { data } = await api.put(`/publishers/${id}`, { name });
    return data;
};

const deletePublisherApi = async (id: number) => {
    const { data } = await api.delete(`/publishers/${id}`);
    return data;
};

// --- HOOKS ---

export const usePublishers = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: ['publishers', page, limit],
        queryFn: () => getPublishers(page, limit),
        staleTime: 1000 * 60 * 5, // 5 phút
        placeholderData: (previousData) => previousData,
    });
};

export const usePublisherMutations = () => {
    const queryClient = useQueryClient();

    const onSuccess = (msg: string) => {
        queryClient.invalidateQueries({ queryKey: ['publishers'] });
        showToast.success(msg);
    };

    const onError = (err: any) => {
        // Hiển thị lỗi từ backend (ví dụ: đang có sách thuộc NXB này)
        showToast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    };

    const add = useMutation({
        mutationFn: addPublisherApi,
        onSuccess: () => onSuccess('Thêm NXB thành công'),
        onError,
    });

    const update = useMutation({
        mutationFn: updatePublisherApi,
        onSuccess: () => onSuccess('Cập nhật NXB thành công'),
        onError,
    });

    const remove = useMutation({
        mutationFn: deletePublisherApi,
        onSuccess: () => onSuccess('Xóa NXB thành công'),
        onError,
    });

    return { add, update, remove };
};