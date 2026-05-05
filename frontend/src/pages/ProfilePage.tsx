// src/pages/ProfilePage.tsx
import { useState } from 'react';
import { Header } from '@/layouts/Header';
import { Footer } from '@/layouts/Footer';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { ProfileTab } from '@/components/profile/tabs/ProfileTab';
import { OrdersTab } from '@/components/profile/tabs/OrdersTab';
import { WishlistTab } from '@/components/profile/tabs/WishlistTab';

export default function ProfilePage() {
    // Chỉ còn 3 tab
    const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist'>('profile');

    return (
        <div className="flex flex-col min-h-screen bg-[#f5f8f8]">
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* SIDEBAR Component */}
                    <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

                    {/* MAIN CONTENT AREA */}
                    <div className="w-full lg:w-3/4 xl:w-4/5">
                        <div className="flex flex-col gap-6">
                            {/* Heading - Đã cập nhật logic hiển thị */}
                            <div>
                                <h1 className="text-stone-900 text-4xl font-black font-display leading-tight tracking-tight">
                                    {activeTab === 'orders' ? 'My Orders' :
                                        activeTab === 'profile' ? 'My Profile' : 'My Wishlist'}
                                </h1>
                                <p className="text-stone-500 mt-1">
                                    {activeTab === 'orders' ? 'Review your past orders and their status.' :
                                        activeTab === 'profile' ? 'Manage your personal information.' : 'Your favorite books collection.'}
                                </p>
                            </div>

                            {/* RENDER CONTENT BASED ON TAB */}
                            {activeTab === 'profile' && <ProfileTab />}
                            {activeTab === 'orders' && <OrdersTab />}
                            {activeTab === 'wishlist' && <WishlistTab />}

                            {/* Đã xóa phần Placeholder cho address và payment */}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}