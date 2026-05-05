// src/pages/ShopPage.tsx
import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Header } from '@/layouts/Header';
import { Footer } from '@/layouts/Footer';
import { ShopSidebar } from '@/components/shop/ShopSidebar';
import { useShopBooks } from '@/hooks/useShop';
import { Button } from '@/components/ui/button';
import { BookCard } from '@/components/book/BookCard';
import { Filter, ChevronLeft, ChevronRight, ArrowDownUp } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { CardBook } from '@/types/book'; // Import type

export default function ShopPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const params = {
        page: Number(searchParams.get('page')) || 1,
        limit: 12,
        keyword: searchParams.get('keyword') || '',
        sort: searchParams.get('sort') || '',
        min_price: Number(searchParams.get('min_price')) || undefined,
        max_price: Number(searchParams.get('max_price')) || undefined,
        genre: searchParams.get('genre') || '',
        author: searchParams.get('author') || '',
        rating: Number(searchParams.get('rating')) || undefined,
    };

    // TypeScript bây giờ đã hiểu data là ShopResponse hoặc undefined
    const { data, isLoading } = useShopBooks(params);

    // Destructure an toàn với default values
    const books = data?.books || [];
    const pagination = data?.pagination || { totalItems: 0, totalPages: 1, currentPage: 1, pageSize: 12 };

    const handlePageChange = (newPage: number) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', newPage.toString());
        setSearchParams(newParams);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('sort', e.target.value);
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    return (
        <div className="bg-[#f5f8f8] text-stone-900 min-h-screen flex flex-col font-sans">
            <Header />

            <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">

                {/* Breadcrumbs */}
                <div className="flex flex-wrap gap-2 text-sm text-stone-500 mb-8">
                    <Link to="/" className="hover:text-[#008080] transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-stone-900 font-medium">Shop</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* SIDEBAR - DESKTOP */}
                    <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
                        <div className="sticky top-24">
                            <ShopSidebar />
                        </div>
                    </aside>

                    {/* MOBILE FILTER DRAWER */}
                    {isMobileFilterOpen && (
                        <div className="fixed inset-0 z-50 flex lg:hidden">
                            <div
                                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                                onClick={() => setIsMobileFilterOpen(false)}
                            ></div>
                            <div className="relative bg-white w-80 h-full p-6 overflow-y-auto animate-in slide-in-from-left duration-300 shadow-2xl">
                                <ShopSidebar onClose={() => setIsMobileFilterOpen(false)} />
                            </div>
                        </div>
                    )}

                    {/* MAIN CONTENT */}
                    <div className="flex-1">
                        {/* Header Area */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                            <div>
                                <h2 className="text-4xl font-bold font-display text-stone-900 tracking-tight">
                                    Explore Books
                                </h2>
                                <p className="text-stone-500 text-sm mt-2">
                                    Showing <span className="font-medium text-stone-900">{books.length}</span> of <span className="font-medium text-stone-900">{pagination.totalItems}</span> results
                                </p>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    className="lg:hidden gap-2 border-stone-300 text-stone-700 flex-1"
                                    onClick={() => setIsMobileFilterOpen(true)}
                                >
                                    <Filter className="w-4 h-4" /> Filters
                                </Button>

                                {/* Sort Dropdown */}
                                <div className="relative flex-1 sm:flex-none">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <ArrowDownUp className="h-4 w-4 text-stone-400" />
                                    </div>
                                    <select
                                        className="h-10 pl-10 pr-4 py-2 w-full sm:w-[180px] rounded-md border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0df2d7] focus:border-transparent cursor-pointer appearance-none"
                                        value={params.sort}
                                        onChange={handleSortChange}
                                    >
                                        <option value="">Default Sorting</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                        <option value="newest">Newest Arrivals</option>
                                        <option value="rating">Top Rated</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* CONTENT AREA */}
                        {isLoading ? (
                            <div className="py-20">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <>
                                {/* PRODUCT GRID */}
                                {books.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                                        {/* Bỏ 'any', dùng đúng type CardBook */}
                                        {books.map((book: CardBook) => (
                                            <div key={book.book_id} className="h-full">
                                                <BookCard book={book} className="h-full hover:-translate-y-1 transition-transform duration-300" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-stone-300">
                                        <div className="p-4 bg-stone-50 rounded-full mb-4">
                                            <Filter className="w-8 h-8 text-stone-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-stone-900 mb-1">No books found</h3>
                                        <p className="text-stone-500 text-sm mb-6">Try adjusting your filters or search keyword.</p>
                                        <Button
                                            variant="outline"
                                            onClick={() => setSearchParams({})}
                                            className="border-[#008080] text-[#008080] hover:bg-[#008080]/10 font-bold"
                                        >
                                            Clear All Filters
                                        </Button>
                                    </div>
                                )}

                                {/* PAGINATION */}
                                {pagination.totalPages > 1 && (
                                    <nav className="flex items-center justify-center pt-12 border-t border-stone-200 mt-12">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handlePageChange(params.page - 1)}
                                                disabled={params.page === 1}
                                                className="h-10 w-10 border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900 rounded-full"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </Button>

                                            <div className="flex items-center px-4 font-medium text-stone-600 text-sm">
                                                Page <span className="mx-1 font-bold text-stone-900">{params.page}</span> of {pagination.totalPages}
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handlePageChange(params.page + 1)}
                                                disabled={params.page === pagination.totalPages}
                                                className="h-10 w-10 border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900 rounded-full"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </nav>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}