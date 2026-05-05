// src/pages/CollectionPage.tsx
import { useEffect, useMemo } from 'react';
import { Header } from '@/layouts/Header';
import { Footer } from '@/layouts/Footer';
import { BookCard } from '@/components/book/BookCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useShopBooks } from '@/hooks/useShop';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Thêm 'genre' vào type
type CollectionType = 'new-releases' | 'bestsellers' | 'deals' | 'children' | 'genre';

interface CollectionPageProps {
    type: CollectionType;
}

export default function CollectionPage({ type }: CollectionPageProps) {
    // Lấy ID từ URL (nếu là trang genre)
    const { id } = useParams<{ id: string }>();
    // Lấy tên thể loại từ state (truyền từ trang Home sang để hiển thị title cho đẹp)
    const location = useLocation();
    const stateTitle = location.state?.title;

    // Config động
    const currentConfig = useMemo(() => {
        const baseConfigs = {
            'new-releases': {
                title: 'New Releases',
                description: "Khám phá những cuốn sách mới nhất vừa cập bến BookStore.",
                params: { sort: 'newest', limit: 20, page: 1 }
            },
            'bestsellers': {
                title: 'Bestsellers',
                description: "Những cuốn sách được yêu thích và đánh giá cao nhất bởi cộng đồng.",
                params: { sort: 'rating', limit: 20, page: 1 }
            },
            'deals': {
                title: 'Best Deals',
                description: "Săn sách giá rẻ với những ưu đãi tốt nhất trong ngày.",
                params: { sort: 'price_asc', limit: 20, page: 1 }
            },
            'children': {
                title: "Children's Books",
                description: "Thế giới diệu kỳ dành cho các độc giả nhí.",
                params: { genre: 'children', limit: 20, page: 1 }
            },
            // Cấu hình cho Genre động
            'genre': {
                title: stateTitle || 'Book Collection', // Dùng tên truyền sang hoặc mặc định
                description: `Khám phá các cuốn sách thuộc thể loại này.`,
                params: { genre: id, limit: 20, page: 1 } // Truyền ID vào params
            }
        };

        return baseConfigs[type];
    }, [type, id, stateTitle]);

    const { data, isLoading, error } = useShopBooks(currentConfig.params);
    const books = data?.books || [];

    // Scroll to top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname, id]);

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="bg-[#f5f8f8] text-stone-900 min-h-screen flex flex-col font-sans">
            <Header />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumbs */}
                <div className="flex flex-wrap gap-2 text-sm text-stone-500 mb-6">
                    <Link to="/" className="hover:text-[#008080] transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-stone-900 font-medium">{currentConfig.title}</span>
                </div>

                {/* Header Section */}
                <div className="flex flex-col gap-4 mb-10 text-center sm:text-left border-b border-stone-200 pb-8">
                    <h1 className="text-4xl md:text-5xl font-bold font-display text-[#2F4F4F] tracking-tight">
                        {currentConfig.title}
                    </h1>
                    <p className="text-lg text-stone-600 max-w-2xl">
                        {currentConfig.description}
                    </p>
                </div>

                {/* Content */}
                {error ? (
                    <div className="text-center py-20">
                        <p className="text-red-500 mb-4">Không thể tải danh sách sách.</p>
                        <Button onClick={() => window.location.reload()} variant="outline">Thử lại</Button>
                    </div>
                ) : books.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-10">
                        {books.map((book) => (
                            <div key={book.book_id} className="h-full">
                                <BookCard book={book} className="h-full hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-md" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-stone-300">
                        <div className="p-4 bg-stone-50 rounded-full mb-4">
                            <Frown className="w-8 h-8 text-stone-300" />
                        </div>
                        <h3 className="text-lg font-bold text-stone-900 mb-1">Chưa có sách nào</h3>
                        <p className="text-stone-500 text-sm mb-6">Hiện chưa có sách thuộc thể loại này.</p>
                        <Link to="/shop">
                            <Button className="bg-[#008080] text-white hover:bg-[#006666]">
                                Khám phá tất cả sách
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Bottom Navigation */}
                <div className="mt-12 pt-8 border-t border-stone-200 flex justify-center">
                    <Link to="/shop">
                        <Button variant="outline" className="border-stone-300 text-stone-600 hover:text-[#008080] hover:border-[#008080]">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Xem tất cả sách tại Shop
                        </Button>
                    </Link>
                </div>

            </main>
            <Footer />
        </div>
    );
}