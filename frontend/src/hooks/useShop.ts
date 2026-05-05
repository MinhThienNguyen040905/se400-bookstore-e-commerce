// src/hooks/useShop.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query'; // Import keepPreviousData
import api from '@/api/axios';
import type { CardBook } from '@/types/book'; // Tận dụng type CardBook đã có

// --- TYPES ---
export interface ShopParams {
    page?: number;
    limit?: number;
    keyword?: string;
    min_price?: number;
    max_price?: number;
    genre?: string;
    author?: string;
    rating?: number;
    sort?: string;
}

// Định nghĩa cấu trúc response từ Backend
export interface ShopResponse {
    books: CardBook[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
    };
}

// --- API CALLS ---
const getPublicBooks = async (params: ShopParams): Promise<ShopResponse> => {
    // Loại bỏ các param undefined/null/rỗng
    const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v != null && v !== '')
    );

    const { data } = await api.get('/books', { params: cleanParams });

    // Kiểm tra cấu trúc trả về, đảm bảo đúng type
    return {
        books: data.books || [],
        pagination: data.pagination || {
            totalItems: 0,
            totalPages: 1,
            currentPage: 1,
            pageSize: 12
        }
    };
};

const getPublicGenres = async () => {
    const { data } = await api.get('/genres');
    return data;
};

const getPublicAuthors = async () => {
    const { data } = await api.get('/authors');
    return data;
};

// --- HOOKS ---
export const useShopBooks = (params: ShopParams) => {
    return useQuery<ShopResponse>({ // Generic type <ShopResponse> giúp TS hiểu data trả về
        queryKey: ['shop-books', params],
        queryFn: () => getPublicBooks(params),
        placeholderData: keepPreviousData, // SỬA LỖI v5 TẠI ĐÂY
        staleTime: 1000 * 60,
    });
};

export const useShopGenres = () => useQuery({ queryKey: ['public-genres'], queryFn: getPublicGenres });
export const useShopAuthors = () => useQuery({ queryKey: ['public-authors'], queryFn: getPublicAuthors });