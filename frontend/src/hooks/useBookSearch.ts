import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';

export interface SearchBook {
    book_id: number;
    title: string;
    cover_image: string;
    price: number;
    authors: string;
}

const searchBooksApi = async (keyword: string) => {
    if (!keyword) return [];
    // Gọi API với limit=5 để lấy 5 kết quả gợi ý
    const { data } = await api.get('/books', {
        params: { keyword, limit: 5, page: 1 }
    });
    return data.books || [];
};

export const useBookSearch = (keyword: string) => {
    return useQuery({
        queryKey: ['search-books', keyword],
        queryFn: () => searchBooksApi(keyword),
        enabled: !!keyword, // Chỉ gọi API khi có keyword
        staleTime: 1000 * 60, // Cache kết quả tìm kiếm trong 1 phút
    });
};