import { BookCard } from './BookCard';
import type { RecommendationItem } from '@/types/recommendation';
import { Sparkles } from 'lucide-react';

interface RecommendationShelfProps {
    title: string;
    items?: RecommendationItem[];
    isLoading?: boolean;
}

export function RecommendationShelf({ title, items = [], isLoading }: RecommendationShelfProps) {
    if (isLoading) {
        return (
            <section className="space-y-4">
                <h2 className="text-[#2F4F4F] text-3xl font-bold font-display">{title}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="h-80 rounded-xl bg-white border border-stone-100 animate-pulse" />
                    ))}
                </div>
            </section>
        );
    }

    if (!items.length) return null;

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-2 px-2">
                <Sparkles className="w-5 h-5 text-[#00796B]" />
                <h2 className="text-[#2F4F4F] text-3xl font-bold font-display">{title}</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {items.slice(0, 5).map((item) => (
                    <div key={item.book.book_id} className="space-y-2">
                        <BookCard book={item.book} />
                        {item.reasons.length > 0 && (
                            <p className="text-xs text-stone-500 leading-relaxed px-1">
                                {item.reasons[0]}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
