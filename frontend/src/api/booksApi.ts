import api from './axios';
import type { CardBook, Book } from '@/types/book';

export const getNewReleases = async (): Promise<CardBook[]> => {
    const { data } = await api.get('/books/new-releases');
    return data;
};

export const getTopRated = async (): Promise<CardBook[]> => {
    const { data } = await api.get('/books/top-rated');
    return data;
};

export const getBookById = async (id: number): Promise<Book> => {
    const { data } = await api.get(`/books/${id}`);
    return data;
};