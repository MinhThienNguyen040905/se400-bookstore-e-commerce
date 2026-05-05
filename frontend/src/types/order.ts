// src/types/order.ts

export interface OrderPromo {
    code: string;
    discount_percent: string;
}

export interface OrderBook {
    book_id: number;
    title: string;
    cover_image: string;
}

export interface OrderItem {
    order_item_id: number;
    quantity: number;
    price: string;
    book: OrderBook | null; // Có thể null nếu sách bị xóa
}

export interface OrderTimeline {
    status: string;
    title: string;
    description: string;
    completedAt: string;
    isCompleted: boolean;
}

export interface Order {
    order_id: number;
    total_price: string;
    status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
    order_date: string;
    promo: OrderPromo | null;
    order_items: OrderItem[];
    status_history: OrderTimeline[];
}