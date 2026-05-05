// src/pages/BookDetailPage.tsx
import { Suspense, useState } from 'react';
import { Header } from '@/layouts/Header';
import { Footer } from '@/layouts/Footer';
import { BookDetailCard } from '@/components/book/BookDetailCard';
import { BookReviews } from '@/components/book/BookReviews';
import { useParams, Link } from 'react-router-dom';
import { useBookDetail, useTopRatedBooks } from '@/hooks/useBooks';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { BookCard } from '@/components/book/BookCard';
import { cn } from '@/lib/utils';

export default function BookDetailPage() {
    return (
        <ErrorBoundary fallback={<p className="text-center py-10">Đã xảy ra lỗi!</p>}>
            <Suspense fallback={<LoadingSpinner />}>
                <BookDetailPageContent />
            </Suspense>
        </ErrorBoundary>
    );
}

function BookDetailPageContent() {
    const { id } = useParams<{ id: string }>();
    const bookId = Number(id);
    const { data: book, error } = useBookDetail(bookId);
    const { data: relatedBooks } = useTopRatedBooks();
    const [activeTab, setActiveTab] = useState<'desc' | 'reviews'>('desc');

    if (error || !book) return <p className="text-center py-10">Không tìm thấy sách!</p>;

    return (
        <div className="flex flex-col min-h-screen bg-[#F8FAFC]"> {/* Màu nền sáng nhẹ */}
            <Header />

            <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumbs */}
                <div className="flex flex-wrap gap-2 mb-8 items-center text-sm">
                    <Link to="/" className="text-slate-500 font-medium hover:text-[#00796B] transition-colors">Home</Link>
                    <span className="text-slate-400">/</span>
                    <span className="text-slate-500 font-medium">Books</span>
                    <span className="text-slate-400">/</span>
                    <span className="text-[#2F4F4F] font-medium truncate max-w-[200px] sm:max-w-none">{book.title}</span>
                </div>

                {/* Main Product Section */}
                <BookDetailCard book={book} />

                {/* Tabs Section */}
                <div className="mt-16">
                    <div className="border-b border-slate-200">
                        <nav className="flex -mb-px gap-8">
                            <button
                                onClick={() => setActiveTab('desc')}
                                className={cn(
                                    "pb-4 text-sm font-bold border-b-2 transition-colors",
                                    activeTab === 'desc'
                                        ? "border-[#00796B] text-[#00796B]" // Màu Active
                                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                                )}
                            >
                                Description
                            </button>
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={cn(
                                    "pb-4 text-sm font-bold border-b-2 transition-colors",
                                    activeTab === 'reviews'
                                        ? "border-[#00796B] text-[#00796B]" // Màu Active
                                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                                )}
                            >
                                Reviews ({book.reviews.length})
                            </button>
                        </nav>
                    </div>

                    <div className="py-8">
                        {activeTab === 'desc' && (
                            <div className="space-y-4 text-slate-600 leading-relaxed max-w-4xl">
                                <h3 className="text-xl font-display font-bold text-[#2F4F4F] mb-2">About the Book</h3>
                                <p>{book.description}</p>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div id="reviews">
                                <BookReviews bookId={ book.book_id} reviews={book.reviews} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Books */}
                <div className="mt-12 mb-12">
                    <h3 className="text-2xl font-bold font-display text-[#2F4F4F] mb-6">Related Books</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                        {relatedBooks?.slice(0, 4).map((relatedBook) => (
                            <BookCard key={relatedBook.book_id} book={relatedBook} />
                        ))}
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
}