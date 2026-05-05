import { useAddToCart } from '@/hooks/useAddToCart';
import { Link } from 'react-router-dom';
import type { CardBook } from '@/types/book';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
// Đã xóa import { Star } vì không còn dùng

interface BookCardProps {
    book: CardBook;
    className?: string;
}

export function BookCard({ book, className }: BookCardProps) {
    const addMutation = useAddToCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addMutation.mutate({ book, quantity: 1 });
    };

    return (
        <Link to={`/book/${book.book_id}`} className="block h-full">
            <div className={cn(
                "flex flex-col gap-3 bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 h-full",
                className
            )}>
                {/* Image Section */}
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-stone-100">
                    <img
                        src={book.cover_image}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                    />
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col">
                    <h3 className="text-gray-900 font-bold text-base truncate font-display" title={book.title}>
                        {book.title}
                    </h3>
                    <p className="text-gray-500 text-sm truncate mb-2">{book.authors}</p>

                    {/* ĐÃ XÓA PHẦN RATING Ở ĐÂY */}

                    {/* Price - Dùng mt-auto để đẩy giá xuống đáy nếu tên sách ngắn */}
                    <p className="text-gray-900 font-semibold text-lg mt-auto">
                        {formatPrice(book.price)}
                    </p>
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#00796B]/10 text-[#00796B] hover:bg-[#00796B] hover:text-white text-sm font-bold transition-colors"
                >
                    Add to Cart
                </button>
            </div>
        </Link>
    );
}