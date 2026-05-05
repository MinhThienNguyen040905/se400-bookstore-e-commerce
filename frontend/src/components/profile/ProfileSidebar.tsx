// src/components/profile/ProfileSidebar.tsx
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
// Đã xóa MapPin và CreditCard khỏi import
import { User, Package, Heart, LogOut } from 'lucide-react';

interface ProfileSidebarProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
}

export function ProfileSidebar({ activeTab, setActiveTab }: ProfileSidebarProps) {
    const { user, logout } = useAuth();

    return (
        <aside className="w-full lg:w-1/4 xl:w-1/5">
            <div className="flex h-full flex-col justify-between bg-white rounded-lg shadow-sm p-4 border border-stone-200">
                <div className="flex flex-col gap-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border border-stone-100">
                            <AvatarImage src={user?.avatar || ''} alt={user?.name} />
                            <AvatarFallback className="bg-stone-100 text-stone-500 font-bold">
                                {user?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden">
                            <h1 className="text-stone-900 text-base font-bold leading-normal truncate font-display">
                                {user?.name || 'Guest'}
                            </h1>
                            <p className="text-stone-500 text-sm font-normal truncate">
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-stone-200 my-2"></div>

                    {/* Navigation - ĐÃ XÓA ADDRESS VÀ PAYMENT */}
                    <nav className="flex flex-col gap-2">
                        <SidebarItem icon={<User className="w-5 h-5" />} label="Profile" id="profile" activeTab={activeTab} onClick={setActiveTab} />
                        <SidebarItem icon={<Package className="w-5 h-5" />} label="Orders" id="orders" activeTab={activeTab} onClick={setActiveTab} />
                        <SidebarItem icon={<Heart className="w-5 h-5" />} label="Wishlist" id="wishlist" activeTab={activeTab} onClick={setActiveTab} />
                    </nav>
                </div>

                {/* Logout */}
                <div className="border-t border-stone-200 mt-4 pt-4">
                    <button
                        onClick={() => logout()}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-stone-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <p className="text-sm font-medium leading-normal">Logout</p>
                    </button>
                </div>
            </div>
        </aside>
    );
}

// Sub-component nội bộ
function SidebarItem({ icon, label, id, activeTab, onClick }: { icon: React.ReactNode; label: string; id: string; activeTab: string; onClick: (id: string) => void }) {
    return (
        <button
            onClick={() => onClick(id)}
            className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full",
                activeTab === id
                    ? "bg-[#0df2d7]/20 text-stone-900"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            )}
        >
            <span className={cn(activeTab === id ? "text-stone-900" : "text-stone-400")}>
                {icon}
            </span>
            <p className="text-sm font-bold leading-normal">{label}</p>
        </button>
    );
}