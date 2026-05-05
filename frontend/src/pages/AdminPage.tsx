// src/pages/AdminPage.tsx
import { useState } from 'react';
import { Header } from '@/layouts/Header';
import { Footer } from '@/layouts/Footer';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Import các components con
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { DashboardTab } from '@/components/admin/tabs/DashboardTab';
import { UsersTab } from '@/components/admin/tabs/UsersTab';
import { BooksTab } from '@/components/admin/tabs/BooksTab';
import { OrdersTab } from '@/components/admin/tabs/OrdersTab';
import { GenresTab } from '@/components/admin/tabs/GenresTab'; // <--- 1. THÊM DÒNG NÀY
import { AuthorsTab } from '@/components/admin/tabs/AuthorsTab';
import { PublishersTab } from '@/components/admin/tabs/PublishersTab';
import { DiscountsTab } from '@/components/admin/tabs/DiscountsTab';

export default function AdminPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');

    // Bảo vệ Client-side
    if (!user || user.role !== 'admin') {
        return (
            <div className="flex flex-col min-h-screen bg-[#f5f8f8]">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <h1 className="text-3xl font-bold font-display text-stone-900 mb-2">Access Denied</h1>
                    <p className="text-stone-500 mb-6">You do not have permission to view the Admin Dashboard.</p>
                    <Link to="/">
                        <Button className="bg-[#0df2d7] text-stone-900 font-bold">Go Back Home</Button>
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    // Hàm render nội dung dựa trên tab
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardTab />;
            case 'users': return <UsersTab />;
            case 'books': return <BooksTab />;
            case 'orders': return <OrdersTab />;

            // --- 2. THÊM CASE NÀY ---
            case 'genres': return <GenresTab />;

            case 'authors': return <AuthorsTab />;
            case 'publishers': return <PublishersTab />;
            case 'discounts': return <DiscountsTab />;

            default: return <DashboardTab />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f5f8f8]">
            <Header />

            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

                    <div className="flex-1 w-full min-w-0">
                        {renderContent()}
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}