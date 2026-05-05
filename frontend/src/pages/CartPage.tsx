// src/pages/CartPage.tsx
import { useState } from 'react';
import { Header } from '@/layouts/Header';
import { Footer } from '@/layouts/Footer';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useCartQuery } from '@/hooks/useCartQuery';
import { useRemoveFromCart, useUpdateCart } from '@/hooks/useCartActions';
import { Link } from 'react-router-dom';
import { showToast } from '@/lib/toast';
import { cn, formatPrice } from '@/lib/utils';

export default function CartPage() {
    const { data: cartData, isLoading } = useCartQuery();
    const items = cartData?.items || [];

    // State chỉ dùng để lưu các item muốn XÓA
    const [selectedItemsForDelete, setSelectedItemsForDelete] = useState<Set<number>>(new Set());

    const updateMutation = useUpdateCart();
    const removeMutation = useRemoveFromCart();

    // 1. LOGIC MỚI: Tính tổng tiền dựa trên TOÀN BỘ item trong giỏ (không quan tâm checkbox)
    const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const handleQuantityChange = (bookId: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        updateMutation.mutate({ book_id: bookId, quantity: newQuantity });
    };

    // Logic xóa các item đã check
    const handleRemoveSelected = () => {
        if (selectedItemsForDelete.size === 0) {
            showToast.error('Please select items to delete');
            return;
        }
        selectedItemsForDelete.forEach((bookId) => {
            removeMutation.mutate(bookId);
        });
        setSelectedItemsForDelete(new Set());
        showToast.success('Selected products have been removed');
    };

    const toggleSelect = (bookId: number) => {
        const newSet = new Set(selectedItemsForDelete);
        if (newSet.has(bookId)) {
            newSet.delete(bookId);
        } else {
            newSet.add(bookId);
        }
        setSelectedItemsForDelete(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedItemsForDelete.size === items.length) {
            setSelectedItemsForDelete(new Set());
        } else {
            setSelectedItemsForDelete(new Set(items.map(i => i.book_id)));
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#f5f8f8]">Loading cart...</div>;

    if (!items.length) {
        return (
            <div className="flex flex-col min-h-screen bg-[#f5f8f8]">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold font-display text-stone-900 mb-4">Your cart is empty</h2>
                        <Link to="/">
                            <Button className="bg-[#0df2d7] hover:bg-[#00dcc3] text-stone-900 font-bold px-8 h-12 rounded-lg">
                                Continue Shopping
                            </Button>
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#f5f8f8]">
            <Header />
            <main className="container mx-auto px-4 py-8 sm:py-12 flex-1">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap gap-2 text-sm">
                        <Link to="/" className="text-stone-500 hover:text-[#0df2d7] font-medium">Home</Link>
                        <span className="text-stone-400">/</span>
                        <span className="text-stone-900 font-medium">Cart</span>
                    </div>

                    <div className="flex flex-wrap justify-between items-baseline gap-3">
                        <h1 className="font-display text-4xl font-black tracking-tighter text-stone-900">Shopping Cart</h1>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 items-start">
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            {/* Toolbar: Checkbox Select All & Delete Button */}
                            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-stone-200 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        checked={selectedItemsForDelete.size === items.length && items.length > 0}
                                        onCheckedChange={toggleSelectAll}
                                        className="w-5 h-5 border-2 border-stone-300 rounded data-[state=checked]:bg-[#0df2d7] data-[state=checked]:border-[#0df2d7] data-[state=checked]:text-stone-900 transition-all"
                                    />
                                    <span className="font-medium text-stone-700">Select to delete ({selectedItemsForDelete.size})</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRemoveSelected}
                                    className="text-stone-500 hover:text-red-500 hover:bg-red-50"
                                    disabled={selectedItemsForDelete.size === 0}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Selected
                                </Button>
                            </div>

                            <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="hidden sm:table-header-group bg-stone-50">
                                            <tr className="border-b border-stone-200">
                                                <th className="px-6 py-4 text-left w-16"></th>
                                                <th className="px-6 py-4 text-left text-stone-600 text-xs font-bold uppercase tracking-wider w-2/5">Product</th>
                                                <th className="px-6 py-4 text-left text-stone-600 text-xs font-bold uppercase tracking-wider">Price</th>
                                                <th className="px-6 py-4 text-left text-stone-600 text-xs font-bold uppercase tracking-wider">Quantity</th>
                                                <th className="px-6 py-4 text-right text-stone-600 text-xs font-bold uppercase tracking-wider">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-stone-200">
                                            {items.map((item) => (
                                                <tr key={item.book_id} className={cn(
                                                    "flex flex-col sm:table-row p-4 sm:p-0 transition-colors",
                                                    selectedItemsForDelete.has(item.book_id) ? "bg-red-50/50" : "bg-white" // Highlight đỏ nhẹ khi chọn xóa
                                                )}>
                                                    <td className="px-0 sm:px-6 py-4 align-middle">
                                                        <Checkbox
                                                            checked={selectedItemsForDelete.has(item.book_id)}
                                                            onCheckedChange={() => toggleSelect(item.book_id)}
                                                            className="w-5 h-5 border-2 border-stone-300 rounded data-[state=checked]:bg-[#0df2d7] data-[state=checked]:border-[#0df2d7] data-[state=checked]:text-stone-900 transition-all"
                                                        />
                                                    </td>
                                                    <td className="px-0 sm:px-6 py-4 w-full sm:w-2/5 align-middle">
                                                        <div className="flex items-center gap-4">
                                                            <img
                                                                src={item.cover_image}
                                                                alt={item.title}
                                                                className="bg-stone-200 aspect-[2/3] object-cover rounded-md h-24 w-16 flex-shrink-0 border border-stone-100"
                                                            />
                                                            <div>
                                                                <Link to={`/book/${item.book_id}`} className="font-bold font-display text-stone-900 hover:text-[#00bbb6] transition-colors line-clamp-2">
                                                                    {item.title}
                                                                </Link>
                                                                <p className="text-stone-500 text-sm mt-1">{item.authors}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-0 sm:px-6 py-2 sm:py-4 align-middle font-medium text-stone-900">
                                                        {formatPrice(item.price)}
                                                    </td>
                                                    <td className="px-0 sm:px-6 py-2 sm:py-4 align-middle">
                                                        <div className="flex items-center border border-stone-200 rounded-lg w-fit bg-white shadow-sm">
                                                            <button
                                                                onClick={() => handleQuantityChange(item.book_id, item.quantity - 1)}
                                                                disabled={item.quantity <= 1}
                                                                className="p-2 text-stone-500 hover:bg-stone-50 hover:text-stone-900 rounded-l-lg disabled:opacity-50 transition-colors"
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                            <input
                                                                className="w-10 text-center bg-transparent border-x border-stone-100 focus:ring-0 focus:outline-none p-2 h-auto text-sm font-bold text-stone-900"
                                                                type="text"
                                                                value={item.quantity}
                                                                readOnly
                                                            />
                                                            <button
                                                                onClick={() => handleQuantityChange(item.book_id, item.quantity + 1)}
                                                                className="p-2 text-stone-500 hover:bg-stone-50 hover:text-stone-900 rounded-r-lg transition-colors"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-0 sm:px-6 py-2 sm:py-4 text-left sm:text-right align-middle font-bold text-stone-900">
                                                        {formatPrice(item.price * item.quantity)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-2">
                                <Link to="/" className="w-full sm:w-auto">
                                    <Button variant="outline" className="w-full sm:w-auto border-stone-200 text-stone-600 hover:bg-stone-100 h-11 font-bold rounded-lg">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Continue Shopping
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Order Summary Column */}
                        <div className="lg:col-span-1 w-full">
                            <div className="bg-white rounded-lg border border-stone-200 p-6 flex flex-col gap-6 sticky top-24 shadow-sm">
                                <h3 className="font-display text-xl font-bold text-stone-900">Order Summary</h3>
                                <div className="flex flex-col border-b border-stone-200 pb-4">
                                    <div className="flex justify-between gap-x-6 py-2">
                                        <p className="text-stone-600 text-sm font-normal">Total Items</p>
                                        <p className="text-stone-900 text-sm font-medium text-right">{items.length}</p>
                                    </div>
                                    <div className="flex justify-between gap-x-6 py-2">
                                        <p className="text-stone-600 text-sm font-normal">Shipping</p>
                                        <p className="text-stone-900 text-sm font-medium text-right">Free</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center gap-x-6">
                                    <p className="font-display font-bold text-lg text-stone-900">Total</p>
                                    <p className="font-display text-2xl font-bold text-right text-[#00bbb6]">
                                        {/* 2. Hiển thị tổng tiền TOÀN BỘ giỏ hàng */}
                                        {formatPrice(totalPrice)}
                                    </p>
                                </div>
                                <Button
                                    asChild
                                    className="w-full h-12 bg-[#0df2d7] hover:bg-[#00dcc3] text-stone-900 font-bold text-base tracking-wide rounded-lg shadow-sm transition-all transform active:scale-95"
                                    // 3. Không disable khi chưa check item nào (vì check là để xóa)
                                    disabled={false}
                                >
                                    <Link to="/checkout">Proceed to Checkout</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}