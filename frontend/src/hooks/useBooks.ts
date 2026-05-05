// src/hooks/useBooks.ts
import { useQuery } from '@tanstack/react-query';
import { getNewReleases, getTopRated, getBookById } from '@/api/booksApi.ts';
import type { Book, CardBook } from '@/types/book';

// Hook cho Selected books
export const useNewReleasesBooks = () => {
    return useQuery<CardBook[], Error>({
        queryKey: ['getNewReleases'],  // Cache key (unique)
        queryFn: getNewReleases,   // Function gọi API
        staleTime: 5 * 60 * 1000,    // Cache 5 phút
        retry: 3,                    // Retry 3 lần nếu fail
    });
};

// Hook cho Must-buy books
export const useTopRatedBooks = () => {
    return useQuery<CardBook[], Error>({
        queryKey: ['getTopRated'],
        queryFn: getTopRated,
        staleTime: 5 * 60 * 1000,
        retry: 3,
    });
};

export const useBookDetail = (id: number) => {
    return useQuery<Book, Error>({
        queryKey: ['book', id],
        queryFn: () => getBookById(id),
        enabled: !!id, // Chỉ gọi khi có id
        staleTime: 10 * 60 * 1000, // Cache 10 phút
    });
};

// Mở rộng sau: useBookDetail(id), useSearchBooks(query), etc.