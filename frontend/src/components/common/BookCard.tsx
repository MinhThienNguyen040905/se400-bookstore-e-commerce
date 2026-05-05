import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';

// Type cho Book
interface BookProps {
    book_id: number;
    title: string;
    cover_image: string;
    price: number;
    stock: number;
    authors?: string; // Tên tác giả dạng chuỗi
    avg_rating?: number;
}

interface BookCardProps {
    book: BookProps;
    className?: string;
}

export function BookCard({ book, className }: BookCardProps) {
    // Giả lập giá gốc để hiện discount (Logic này có thể lấy từ DB nếu có trường original_price)
    // Tạm tính giá gốc cao hơn 20% để demo giao diện
    const fakeOriginalPrice = book.price * 1.2;

    return (
        <div className={cn("flex flex-col bg-white rounded-xl overflow-hidden shadow-sm border border-stone-200 group hover:shadow-xl transition-all duration-300", className)}>

            {/* IMAGE SECTION */}
            <div className="relative overflow-hidden aspect-[2/3] bg-stone-100">
                <Link to={`/book/${book.book_id}`}>
                    <img
                        src={book.cover_image}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                    />
                </Link>

                {/* Wishlist Button (Top Right) */}
                <button className="absolute top-3 right-3 h-9 w-9 flex items-center justify-center rounded-full bg-white/90 text-stone-400 hover:text-[#D9534F] hover:bg-white shadow-sm transition-all transform hover:scale-110 z-10">
                    <Heart className="w-5 h-5" />
                </button>

                {/* Badge (Ví dụ: Sale hoặc New) */}
                <div className="absolute top-3 left-3 bg-[#D9534F] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm">
                    Sale
                </div>

                {/* Quick Add Overlay (Optional style) */}
                {book.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold uppercase border-2 border-white px-4 py-2 rounded-md">Out of Stock</span>
                    </div>
                )}
            </div>

            {/* CONTENT SECTION */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Title & Author */}
                <div className="mb-3">
                    <Link to={`/book/${book.book_id}`}>
                        <h3 className="text-lg font-bold font-heading leading-tight text-stone-900 line-clamp-2 group-hover:text-[#008080] transition-colors min-h-[1.5em]">
                            {book.title}
                        </h3>
                    </Link>
                    <p className="text-sm text-stone-500 mt-1 line-clamp-1">{book.authors || "Unknown Author"}</p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                    <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={cn("w-4 h-4", i < Math.round(book.avg_rating || 0) ? "fill-current" : "text-stone-200 fill-stone-200")}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-stone-400 font-medium pt-0.5">({book.avg_rating || 0})</span>
                </div>

                {/* Price & Action */}
                <div className="mt-auto pt-4 border-t border-stone-100">
                    <div className="flex items-end justify-between gap-2 mb-4">
                        <div className="flex flex-col">
                            <span className="text-xs text-stone-400 line-through decoration-stone-400">
                                {formatPrice(fakeOriginalPrice)}
                            </span>
                            <span className="text-xl font-bold text-[#D9534F]">
                                {formatPrice(book.price)}
                            </span>
                        </div>
                    </div>

                    <Button
                        className="w-full bg-[#008080] hover:bg-[#006666] text-white font-bold h-10 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={book.stock <= 0}
                    >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {book.stock > 0 ? "Add to Cart" : "Sold Out"}
                    </Button>
                </div>
            </div>
        </div>
    );
}