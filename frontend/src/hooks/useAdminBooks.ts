// src/hooks/useAdminBooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import { showToast } from '@/lib/toast';

// --- TYPES ---
export interface Author {
    author_id: number;
    name: string;
}

export interface Genre {
    genre_id: number;
    name: string;
}

export interface Publisher {
    publisher_id: number;
    name: string;
}

export interface Book {
    book_id: number;
    title: string;
    description: string;
    publisher_id: number;
    stock: number;
    price: number;
    release_date: string;
    isbn: string;
    cover_image: string;
    Publisher?: Publisher;
    Authors?: Author[];
    Genres?: Genre[];
}

interface BooksResponse {
    books: Book[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
    };
}

// --- API FUNCTIONS ---

// 1. Get Books (Phân trang)
const getBooks = async (page: number, limit: number): Promise<BooksResponse> => {
    const { data } = await api.get('/books/all', { params: { page, limit } });
    return data;
};

// 2. Get Authors & Genres (Cho dropdown)
const getAuthors = async (): Promise<Author[]> => {
    const { data } = await api.get('/authors');
    return data;
};

const getGenres = async (): Promise<Genre[]> => {
    const { data } = await api.get('/genres');
    return data;
};

// 3. CRUD Operations
// Lưu ý: data gửi lên là FormData để hỗ trợ upload ảnh
const addBookApi = async (formData: FormData) => {
    const { data } = await api.post('/books', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

const updateBookApi = async ({ id, formData }: { id: number; formData: FormData }) => {
    const { data } = await api.put(`/books/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

const deleteBookApi = async (id: number) => {
    const { data } = await api.delete(`/books/${id}`);
    return data;
};

const getPublishers = async (): Promise<Publisher[]> => {
    const { data } = await api.get('/publishers'); // Giả sử route này tồn tại
    return data;
};

// --- HOOKS ---

export const useAdminBooks = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: ['admin-books', page, limit],
        queryFn: () => getBooks(page, limit),
        staleTime: 5000, // Cache 5s
    });
};

export const useAuthors = () => useQuery({ queryKey: ['authors'], queryFn: getAuthors, staleTime: 1000 * 60 * 10 });
export const useGenres = () => useQuery({ queryKey: ['genres'], queryFn: getGenres, staleTime: 1000 * 60 * 10 });

export const usePublishers = () => useQuery({
    queryKey: ['publishers'],
    queryFn: getPublishers,
    staleTime: 1000 * 60 * 10
});

export const useBookMutations = () => {
    const queryClient = useQueryClient();

    const onSuccess = (msg: string) => {
        queryClient.invalidateQueries({ queryKey: ['admin-books'] });
        showToast.success(msg);
    };

    const onError = (err: any) => {
        showToast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    };

    const add = useMutation({
        mutationFn: addBookApi,
        onSuccess: () => onSuccess('Thêm sách thành công'),
        onError,
    });

    const update = useMutation({
        mutationFn: updateBookApi,
        onSuccess: () => onSuccess('Cập nhật sách thành công'),
        onError,
    });

    const remove = useMutation({
        mutationFn: deleteBookApi,
        onSuccess: () => onSuccess('Xóa sách thành công'),
        onError,
    });

    return { add, update, remove };
};