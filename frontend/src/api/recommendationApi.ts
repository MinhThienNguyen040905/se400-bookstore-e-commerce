import api from './axios';
import type { RecommendationItem } from '@/types/recommendation';

export const getPersonalizedRecommendations = async (limit = 10): Promise<RecommendationItem[]> => {
    const { data } = await api.get('/recommendations/personalized', { params: { limit } });
    return data;
};

export const getTrendingRecommendations = async (limit = 10): Promise<RecommendationItem[]> => {
    const { data } = await api.get('/recommendations/trending', { params: { limit } });
    return data;
};

export const getSimilarBooks = async (bookId: number, limit = 8): Promise<RecommendationItem[]> => {
    const { data } = await api.get(`/recommendations/books/${bookId}/similar`, { params: { limit } });
    return data;
};
