import { useQuery } from '@tanstack/react-query';
import {
    getPersonalizedRecommendations,
    getSimilarBooks,
    getTrendingRecommendations
} from '@/api/recommendationApi';
import type { RecommendationItem } from '@/types/recommendation';

export const usePersonalizedRecommendations = (limit = 10) => {
    return useQuery<RecommendationItem[], Error>({
        queryKey: ['recommendations', 'personalized', limit],
        queryFn: () => getPersonalizedRecommendations(limit),
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
};

export const useTrendingRecommendations = (limit = 10) => {
    return useQuery<RecommendationItem[], Error>({
        queryKey: ['recommendations', 'trending', limit],
        queryFn: () => getTrendingRecommendations(limit),
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
};

export const useSimilarBooks = (bookId: number, limit = 8) => {
    return useQuery<RecommendationItem[], Error>({
        queryKey: ['recommendations', 'similar', bookId, limit],
        queryFn: () => getSimilarBooks(bookId, limit),
        enabled: !!bookId,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
};
