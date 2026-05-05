
import { BookCard } from './BookCard';
import type { CardBook } from '@/types/book';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

interface BookSliderProps {
    title: string;
    books: CardBook[];
}

export function BookSlider({ title, books }: BookSliderProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{title}</h2>

            </div>
            <div className='flex flex-row items-center gap-4'>
                <button
                    onClick={() => scroll('left')}
                    className="p-5 rounded-full "
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {books.map((book) => (
                        <div key={book.book_id} className="flex-shrink-0 w-48">
                            <BookCard book={book} />
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => scroll('right')}
                    className="p-2 rounded-full"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

            </div>


        </section>
    );
}