// src/components/profile/tabs/WishlistTab.tsx
import { Link } from 'react-router-dom';
import { useWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingCart, HeartOff, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { formatPrice } from '@/lib/utils';

export function WishlistTab() {
    const { data: wishlistItems, isLoading, isError } = useWishlist();
    const { mutate: removeBook, isPending: isRemoving } = useRemoveFromWishlist();

    // Loading State
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-80 bg-stone-100 rounded-xl"></div>
                ))}
            </div>
        );
    }

    // Error State
    if (isError) {
        return <div className="text-red-500 text-center py-10">Không thể tải danh sách yêu thích.</div>;
    }

    // Empty State
    if (!wishlistItems || wishlistItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-stone-200 border-dashed">
                <div className="p-4 bg-stone-50 rounded-full mb-4">
                    <HeartOff className="w-8 h-8 text-stone-400" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-2">Danh sách yêu thích trống</h3>
                <p className="text-stone-500 text-sm mb-6">Hãy thêm những cuốn sách bạn yêu thích để xem lại sau.</p>
                <Link to="/">
                    <Button className="bg-[#0df2d7] text-stone-900 font-bold hover:bg-[#00dcc3]">
                        Khám phá sách ngay
                    </Button>
                </Link>
            </div>
        );
    }

    // List Items
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {wishlistItems.map((item) => (
                    <div
                        key={item.wishlist_id}
                        className="group relative flex flex-col bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                        {/* Image Area - Click chuyển sang Book Detail */}
                        <Link to={`/book/${item.book.book_id}`} className="relative aspect-[3/4] overflow-hidden bg-stone-100">
                            <img
                                src={item.book.cover_image}
                                alt={item.book.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {/* Badge Stock */}
                            {item.book.stock <= 0 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <span className="bg-white text-stone-900 text-xs font-bold px-3 py-1 rounded-full uppercase">
                                        Hết hàng
                                    </span>
                                </div>
                            )}
                        </Link>

                        {/* Content Area */}
                        <div className="p-4 flex flex-col flex-1">
                            <Link to={`/book/${item.book.book_id}`}>
                                <h3 className="font-bold text-stone-900 line-clamp-1 hover:text-[#00bbb6] transition-colors" title={item.book.title}>
                                    {item.book.title}
                                </h3>
                            </Link>
                            <p className="text-xs text-stone-500 mt-1 line-clamp-1">{item.book.authors}</p>

                            <div className="mt-auto pt-4 flex items-center justify-between">
                                <span className="text-lg font-bold text-[#00bbb6]">
                                    {formatPrice(item.book.price)}
                                </span>
                                <span className="text-[10px] text-stone-400">
                                    Added: {format(new Date(item.added_at), 'dd/MM/yyyy')}
                                </span>
                            </div>
                        </div>

                        {/* Actions Bar (Overlay hoặc nằm dưới) */}
                        <div className="p-4 pt-0 flex gap-2">
                            {/* Nút Xem chi tiết / Mua hàng */}
                            <Link to={`/book/${item.book.book_id}`} className="flex-1">
                                <Button variant="outline" className="w-full border-stone-200 hover:border-[#00bbb6] hover:text-[#00bbb6]">
                                    <ShoppingCart className="w-4 h-4 mr-2" /> Mua ngay
                                </Button>
                            </Link>

                            {/* Nút Xóa */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-stone-400 hover:text-red-500 hover:bg-red-50 border border-stone-200"
                                onClick={() => removeBook(item.book.book_id)}
                                disabled={isRemoving}
                                title="Xóa khỏi yêu thích"
                            >
                                {isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}