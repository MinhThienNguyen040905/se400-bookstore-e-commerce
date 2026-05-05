// src/hooks/useGenres.ts
import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';

export interface Genre {
    genre_id: number;
    name: string;
}

const getGenresApi = async (): Promise<Genre[]> => {
    const { data } = await api.get('/genres');
    return data;
};

export const useGenres = () => {
    return useQuery({
        queryKey: ['genres'],
        queryFn: getGenresApi,
        staleTime: 1000 * 60 * 60, // Cache 1 tiếng vì thể loại ít thay đổi
    });
};