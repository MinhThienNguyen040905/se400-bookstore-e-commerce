// src/layouts/Header.tsx
import { Search, ShoppingCart, User, BookOpen, LogOut, UserCircle, LayoutDashboard, Package } from 'lucide-react';
import { useCartQuery } from '@/hooks/useCartQuery';
import { SearchBar } from '@/components/common/SearchBar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Link, useLocation } from 'react-router-dom'; // Import useLocation
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils'; // Import cn

export function Header() {
    useCartQuery();
    const { data: cartData } = useCartQuery();
    const itemCount = cartData?.total_items ?? 0;
    const { user, logout } = useAuth();
    const location = useLocation(); // Hook to get current path

    // Define navigation items with paths
    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Shop', path: '/shop' }, // Added Shop for better navigation
        { name: 'About', path: '/about' },
        // { name: 'Blog', path: '/blog' }, // Can add back later if you have a blog
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm shadow-sm transition-all duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo Section */}
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 group">
                            <BookOpen className="w-8 h-8 text-[#0df2d7] transition-transform group-hover:scale-110" />
                            <h2 className="text-xl font-bold font-display tracking-tight text-[#2F4F4F] group-hover:text-[#0df2d7] transition-colors">
                                BookStore
                            </h2>
                        </Link>

                        {/* Nav Links - Updated to be dynamic and active-aware */}
                        <nav className="hidden md:flex items-center gap-6">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={cn(
                                            "text-sm font-medium transition-colors relative py-1",
                                            isActive ? "text-[#0df2d7] font-bold" : "text-stone-700 hover:text-[#0df2d7]"
                                        )}
                                    >
                                        {item.name}
                                        {/* Active underline indicator */}
                                        {isActive && (
                                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0df2d7] rounded-full"></span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        {/* Search Bar */}
                        <div className="hidden sm:block w-full max-w-xs mr-4">
                            <SearchBar />
                        </div>

                        <div className="flex gap-2">
                            {user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 focus:ring-2 focus:ring-[#0df2d7] focus:ring-offset-2">
                                            <Avatar className="h-9 w-9 border border-gray-200">
                                                <AvatarImage src={user.avatar || ''} alt={user.name} />
                                                <AvatarFallback className="font-bold text-gray-600 bg-gray-200">{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56 mt-2" align="end">
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none truncate">{user.name}</p>
                                                <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {user.role === 'admin' && (
                                            <DropdownMenuItem asChild>
                                                <Link to="/admin" className="cursor-pointer w-full flex items-center text-[#00796B] font-medium">
                                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                                    <span>Admin Dashboard</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem asChild>
                                            <Link to="/profile" className="cursor-pointer w-full flex items-center">
                                                <UserCircle className="mr-2 h-4 w-4" />
                                                <span>Profile</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link to="/my-orders" className="cursor-pointer w-full flex items-center">
                                                <Package className="mr-2 h-4 w-4" />
                                                <span>My Orders</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => logout()} className="text-red-600 focus:text-red-600 cursor-pointer focus:bg-red-50">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Log out</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Link to="/login">
                                    <Button variant="ghost" size="icon" className="rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-[#0df2d7]">
                                        <User className="w-5 h-5" />
                                    </Button>
                                </Link>
                            )}

                            {/* Cart */}
                            <Link to="/cart">
                                <Button variant="ghost" size="icon" className="relative rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-[#0df2d7]">
                                    <ShoppingCart className="w-5 h-5" />
                                    {itemCount > 0 && (
                                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-[#0df2d7] text-stone-900 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm">
                                            {itemCount}
                                        </span>
                                    )}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}