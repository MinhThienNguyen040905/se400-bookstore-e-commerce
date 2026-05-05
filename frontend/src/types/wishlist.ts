// src/types/wishlist.ts
export interface WishlistBook {
    book_id: number;
    title: string;
    price: number;
    cover_image: string;
    stock: number;
    authors: string;
}

export interface WishlistItem {
    wishlist_id: number;
    added_at: string;
    book: WishlistBook;
}