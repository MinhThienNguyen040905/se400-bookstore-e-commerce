// src/layouts/AuthLayout.tsx
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BookOpen } from 'lucide-react'; // Dùng icon có sẵn

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    showTabs?: boolean; // Ẩn tabs ở trang Reset Password
}

export function AuthLayout({ children, title, subtitle, showTabs = true }: AuthLayoutProps) {
    const location = useLocation();
    const isLogin = location.pathname === '/login';

    return (
        <div className="min-h-screen w-full flex flex-col font-sans text-stone-900 bg-[#f5f8f8]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dbe6e5' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>

            {/* Header tối giản cho Auth */}
            <header className="flex items-center gap-2 p-6 md:p-8">
                <Link to="/" className="flex items-center gap-2 group">
                    <span className="p-2 bg-[#0df2d7] rounded-lg text-stone-900 group-hover:bg-[#00dcc3] transition-colors">
                        <BookOpen className="w-6 h-6" />
                    </span>
                    <span className="text-xl font-bold font-display text-stone-900">BookStore</span>
                </Link>
            </header>

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md space-y-8">

                    <div className="bg-white/80 backdrop-blur-xl shadow-2xl shadow-stone-200/50 rounded-2xl border border-white/20">
                        {/* Tabs Toggle */}
                        {showTabs && (
                            <div className="p-4 pb-0">
                                <div className="flex h-12 bg-[#f5f8f8] p-1 rounded-xl">
                                    <Link
                                        to="/login"
                                        className={cn(
                                            "flex-1 flex items-center justify-center rounded-lg text-sm font-bold transition-all",
                                            isLogin ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
                                        )}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className={cn(
                                            "flex-1 flex items-center justify-center rounded-lg text-sm font-bold transition-all",
                                            !isLogin ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
                                        )}
                                    >
                                        Register
                                    </Link>
                                </div>
                            </div>
                        )}

                        <div className="p-8 pt-6">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-black font-display text-stone-900 tracking-tight">{title}</h1>
                                <p className="text-stone-500 mt-2 text-sm font-medium">{subtitle}</p>
                            </div>

                            {children}

                            {/* Social Login Divider (Optional decoration) */}
                            <div className="mt-8">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-stone-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="bg-white px-2 text-stone-400">Or continue with</span>
                                    </div>
                                </div>
                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <button type="button" className="flex items-center justify-center gap-2 px-4 py-2 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors font-medium text-sm text-stone-600">
                                        <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                        Google
                                    </button>
                                    <button type="button" className="flex items-center justify-center gap-2 px-4 py-2 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors font-medium text-sm text-stone-600">
                                        <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                        Facebook
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}