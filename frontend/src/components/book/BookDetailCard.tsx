// src/components/book/BookDetailCard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Star, Minus, Plus, ShoppingCart, Heart } from 'lucide-react';
import type { Book } from '@/types/book';
import { useAddToCart } from '@/hooks/useAddToCart';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleWishlistApi } from '@/api/wishlistApi';
import { showToast } from '@/lib/toast';
import { formatPrice } from '@/lib/utils';

export function BookDetailCard({ book }: { book: Book }) {
    const [quantity, setQuantity] = useState(1);
    const addMutation = useAddToCart();
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Local state for instant UI feedback
    const [isInWishlist, setIsInWishlist] = useState(book.is_in_wishlist);

    // Sync state when server data changes
    useEffect(() => {
        setIsInWishlist(book.is_in_wishlist);
    }, [book.is_in_wishlist]);

    // Mutation to toggle wishlist
    const wishlistMutation = useMutation({
        mutationFn: toggleWishlistApi,
        onSuccess: (data) => {
            const isAdded = data.action === 'added';
            setIsInWishlist(isAdded);
            showToast.success(data.message || (isAdded ? 'Added to wishlist' : 'Removed from wishlist'));
            queryClient.invalidateQueries({ queryKey: ['book', book.book_id] });
        },
        onError: (err: any) => {
            showToast.error(err.message || 'Failed to update wishlist');
            // Revert state on error
            setIsInWishlist(!isInWishlist);
        }
    });

    const handleAddToCart = () => {
        addMutation.mutate({ book, quantity });
    };

    const handleToggleWishlist = () => {
        if (!user) {
            showToast.error("Please login to add to wishlist");
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
        // Optimistic update
        setIsInWishlist((prev) => !prev);
        wishlistMutation.mutate(book.book_id);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            {/* LEFT: Single Image */}
            <div className="flex flex-col gap-4">
                <div
                    className="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-xl shadow-md transition-transform duration-300 hover:scale-105 border border-gray-100"
                    style={{ backgroundImage: `url("${book.cover_image}")` }}
                ></div>
            </div>

            {/* RIGHT: Product Details */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-[#2F4F4F] text-4xl lg:text-5xl font-bold font-display leading-tight tracking-tight">
                        {book.title}
                    </h1>
                    <p className="text-gray-600 text-lg">
                        by <span className="text-[#00796B] font-medium hover:underline cursor-pointer">{book.authors}</span>
                    </p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={cn("w-5 h-5", star <= Math.round(book.avg_rating) ? "fill-current" : "text-gray-300")}
                                fill={star <= Math.round(book.avg_rating) ? "currentColor" : "none"}
                                strokeWidth={0}
                            />
                        ))}
                    </div>
                    <a href="#reviews" className="text-slate-500 text-sm hover:text-[#00796B] underline-offset-4 hover:underline">
                        ({book.reviews.length} reviews)
                    </a>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                    <span className="text-[#2F4F4F] text-4xl font-bold font-display">
                        {formatPrice(book.price)}
                    </span>
                    <span className="text-red-400 text-xl line-through">
                        {formatPrice(book.price * 1.2)}
                    </span>
                </div>

                <p className="text-slate-600 leading-relaxed text-base">
                    {book.description}
                </p>

                {/* Metadata */}
                <ul className="text-slate-600 space-y-2 text-sm">
                    <li className="flex gap-2"><strong className="font-medium text-[#2F4F4F] w-32">ISBN:</strong> {book.isbn}</li>
                    <li className="flex gap-2"><strong className="font-medium text-[#2F4F4F] w-32">Stock:</strong> {book.stock} available</li>
                    <li className="flex gap-2"><strong className="font-medium text-[#2F4F4F] w-32">Publisher:</strong> {book.publisher}</li>
                    <li className="flex gap-2"><strong className="font-medium text-[#2F4F4F] w-32">Release Date:</strong> {new Date(book.release_date).toLocaleDateString()}</li>
                </ul>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-slate-200">
                    {/* Quantity */}
                    <div className="flex items-center border border-slate-300 rounded-lg h-12 bg-white">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="px-4 text-slate-500 hover:text-[#00796B] h-full transition-colors"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <input
                            className="w-12 text-center bg-transparent border-x border-slate-300 text-[#2F4F4F] font-medium h-full focus:outline-none"
                            type="text"
                            value={quantity}
                            readOnly
                        />
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="px-4 text-slate-500 hover:text-[#00796B] h-full transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Add to Cart */}
                    <Button
                        onClick={handleAddToCart}
                        className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-lg h-12 px-6 bg-[#00796B] hover:bg-[#00695C] text-white font-bold text-base shadow-sm border-none transition-all"
                        disabled={book.stock <= 0}
                    >
                        <ShoppingCart className="w-5 h-5" />
                        {book.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </Button>

                    {/* Wishlist Button */}
                    <button
                        onClick={handleToggleWishlist}
                        className={cn(
                            "w-full sm:w-auto flex items-center justify-center rounded-lg h-12 px-4 border transition-all duration-300",
                            isInWishlist
                                ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
                                : "border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-[#00796B]"
                        )}
                        title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                        <Heart className={cn("w-5 h-5", isInWishlist && "fill-current")} />
                    </button>
                </div>
            </div>
        </div>
    );
}