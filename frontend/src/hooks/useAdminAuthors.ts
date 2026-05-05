// src/hooks/useAdminAuthors.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import { showToast } from '@/lib/toast';

// --- TYPES ---
export interface Author {
    author_id: number;
    name: string;
}

// Type mới khớp với response backend
interface AuthorsResponse {
    authors: Author[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
    };
}

// --- API CALLS ---
// Cập nhật hàm này để nhận page và limit
const getAuthors = async (page: number, limit: number): Promise<AuthorsResponse> => {
    const { data } = await api.get('/authors', { params: { page, limit } });
    return data;
};

// ... (Các hàm add, update, delete giữ nguyên) ...
const addAuthorApi = async (name: string) => {
    const { data } = await api.post('/authors', { name });
    return data;
};
const updateAuthorApi = async ({ id, name }: { id: number; name: string }) => {
    const { data } = await api.put(`/authors/${id}`, { name });
    return data;
};
const deleteAuthorApi = async (id: number) => {
    const { data } = await api.delete(`/authors/${id}`);
    return data;
};

// --- HOOKS ---

// Cập nhật Hook này: Nhận page, limit và thêm vào queryKey
export const useAuthors = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: ['authors', page, limit], // Key thay đổi -> API tự gọi lại
        queryFn: () => getAuthors(page, limit),
        staleTime: 1000 * 60 * 5, // 5 phút
        placeholderData: (previousData) => previousData, // Giữ dữ liệu cũ khi đang load trang mới (UX mượt hơn)
    });
};

export const useAuthorMutations = () => {
    const queryClient = useQueryClient();

    const onSuccess = (msg: string) => {
        queryClient.invalidateQueries({ queryKey: ['authors'] });
        showToast.success(msg);
    };

    const onError = (err: any) => {
        showToast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    };

    const add = useMutation({
        mutationFn: addAuthorApi,
        onSuccess: () => onSuccess('Thêm tác giả thành công'),
        onError,
    });

    const update = useMutation({
        mutationFn: updateAuthorApi,
        onSuccess: () => onSuccess('Cập nhật tác giả thành công'),
        onError,
    });

    const remove = useMutation({
        mutationFn: deleteAuthorApi,
        onSuccess: () => onSuccess('Xóa tác giả thành công'),
        onError,
    });

    return { add, update, remove };
};