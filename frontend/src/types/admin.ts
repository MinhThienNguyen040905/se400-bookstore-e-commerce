// src/types/admin.ts

export interface StatUser {
    user_id: number;
    name: string;
    email: string;
}

export interface StatBook {
    title: string;
    cover_image: string;
}

export interface StatOrderItem {
    order_item_id: number;
    quantity: number;
    price: number;
    book_id: number;
    Book: StatBook;
}

export interface RecentOrder {
    order_id: number;
    total_price: number;
    status: string;
    order_date: string;
    payment_method: string;
    user_id: number;
    User: StatUser;
    OrderItems: StatOrderItem[];
}

// --- BỔ SUNG Ở ĐÂY ---
export interface MonthlyRevenue {
    name: string;    // Tên tháng (Jan, Feb...)
    revenue: number; // Doanh thu
}

export interface DashboardStats {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    recentOrders: RecentOrder[];
    monthlyRevenue: MonthlyRevenue[]; // <--- Thêm dòng này
}