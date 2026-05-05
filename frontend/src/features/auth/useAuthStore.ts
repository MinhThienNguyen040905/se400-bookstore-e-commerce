import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/api/axios';

interface User {
    user_id: number;
    email: string;
    name: string;
    role: string;
    phone: string;
    address: string;
    avatar: string | null; // Cập nhật để hỗ trợ avatar null
}

interface AuthStore {
    user: User | null;
    accessToken: string | null;
    setAccessToken: (token: string) => void;
    setUser: (user: User) => void;
    updateUser: (updates: Partial<User>) => void; // <--- THÊM DÒNG NÀY
    clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            setAccessToken: (accessToken) => {
                set({ accessToken });
                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            },
            setUser: (user) => {
                console.log('Setting user:', user); // Debug
                set({ user });
            },
            clearAuth: () => {
                delete api.defaults.headers.common['Authorization'];
                set({ user: null, accessToken: null });
                localStorage.removeItem('auth-storage');
            },
            updateUser: (updates) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null
                })),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
            }),
        }
    )
);