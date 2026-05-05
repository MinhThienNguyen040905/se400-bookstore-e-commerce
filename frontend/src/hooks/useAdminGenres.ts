// src/hooks/useAdminGenres.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import { showToast } from '@/lib/toast';

// --- TYPES ---
export interface Genre {
    genre_id: number;
    name: string;
}

// --- API CALLS ---
const getGenres = async (): Promise<Genre[]> => {
    const { data } = await api.get('/genres');
    return data;
};

const addGenreApi = async (name: string) => {
    const { data } = await api.post('/genres', { name });
    return data;
};

const updateGenreApi = async ({ id, name }: { id: number; name: string }) => {
    const { data } = await api.put(`/genres/${id}`, { name });
    return data;
};

const deleteGenreApi = async (id: number) => {
    const { data } = await api.delete(`/genres/${id}`);
    return data;
};

// --- HOOKS ---

export const useGenres = () => {
    return useQuery({
        queryKey: ['genres'],
        queryFn: getGenres,
        staleTime: 1000 * 60 * 10, // Cache 10 phút
    });
};

export const useGenreMutations = () => {
    const queryClient = useQueryClient();

    const onSuccess = (msg: string) => {
        queryClient.invalidateQueries({ queryKey: ['genres'] });
        showToast.success(msg);
    };

    const onError = (err: any) => {
        // Hiển thị thông báo lỗi từ Backend (ví dụ: đang có sách thuộc thể loại này)
        showToast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    };

    const add = useMutation({
        mutationFn: addGenreApi,
        onSuccess: () => onSuccess('Thêm thể loại thành công'),
        onError,
    });

    const update = useMutation({
        mutationFn: updateGenreApi,
        onSuccess: () => onSuccess('Cập nhật thể loại thành công'),
        onError,
    });

    const remove = useMutation({
        mutationFn: deleteGenreApi,
        onSuccess: () => onSuccess('Xóa thể loại thành công'),
        onError,
    });

    return { add, update, remove };
};