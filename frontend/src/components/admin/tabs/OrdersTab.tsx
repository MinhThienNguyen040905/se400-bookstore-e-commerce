// src/components/admin/tabs/OrdersTab.tsx
import { useState } from 'react';
import { useAdminOrders, useUpdateOrderStatus } from '@/hooks/useAdminOrders';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Eye, PackageOpen, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn, formatPrice } from '@/lib/utils';
// Import Modal mới
import { OrderModal } from '../orders/OrderModal';

export function OrdersTab() {
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, isLoading, isError } = useAdminOrders(page, limit);
    const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();

    // State quản lý việc hiển thị modal xem chi tiết
    const [viewOrderId, setViewOrderId] = useState<number | null>(null);

    const handleStatusChange = (orderId: number, newStatus: string) => {
        updateStatus({ order_id: orderId, status: newStatus });
    };

    if (isLoading) return <div className="p-12 text-center text-stone-500">Loading orders...</div>;
    if (isError) return <div className="p-12 text-center text-red-500">Failed to load orders.</div>;

    const { orders, pagination } = data || { orders: [], pagination: { totalPages: 1, currentPage: 1, totalItems: 0 } };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold font-display text-stone-900">Order Management</h2>
                    <p className="text-stone-500 text-sm mt-1">Total: {pagination.totalItems} orders</p>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-stone-50 border-b border-stone-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase">Order ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase">Customer</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase">Total</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {orders.map((order) => (
                                <tr key={order.order_id} className="hover:bg-stone-50 transition-colors">
                                    {/* ... Các cột khác giữ nguyên ... */}
                                    <td className="px-6 py-4"><span className="font-bold text-stone-900">#{order.order_id}</span></td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-stone-900 text-sm flex items-center gap-1">
                                                <User className="w-3 h-3 text-stone-400" /> {order.User?.name || 'Guest'}
                                            </span>
                                            <span className="text-xs text-stone-500 mt-0.5">{order.User?.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-stone-600">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-stone-400" />
                                            {format(new Date(order.order_date), 'dd/MM/yyyy')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-stone-900">
                                        {formatPrice(order.total_price)}
                                    </td>

                                    <td className="px-6 py-4">
                                        <StatusSelect
                                            currentStatus={order.status}
                                            onChange={(newStatus) => handleStatusChange(order.order_id, newStatus)}
                                            disabled={isUpdating}
                                        />
                                    </td>

                                    {/* Actions - NÚT VIEW */}
                                    <td className="px-6 py-4 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-[#00bbb6] hover:text-[#0df2d7] hover:bg-[#0df2d7]/10"
                                            onClick={() => setViewOrderId(order.order_id)} // SET STATE ĐỂ MỞ MODAL
                                        >
                                            <Eye className="w-4 h-4 mr-1" /> View
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center justify-between px-6 py-4 border-t border-stone-200 bg-stone-50">
                    <span className="text-xs text-stone-500">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline" size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline" size="sm"
                            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                            disabled={page === pagination.totalPages}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* ... Pagination giữ nguyên ... */}
            </div>

            {/* --- MODAL VIEW DETAIL --- */}
            <OrderModal
                orderId={viewOrderId}
                onClose={() => setViewOrderId(null)}
            />

        </div>
    );
}

// ... StatusSelect giữ nguyên
function StatusSelect({ currentStatus, onChange, disabled }: { currentStatus: string, onChange: (val: string) => void, disabled: boolean }) {
    const statusConfig: Record<string, string> = {
        processing: "bg-yellow-100 text-yellow-800 border-yellow-200",
        shipped: "bg-blue-100 text-blue-800 border-blue-200",
        delivered: "bg-green-100 text-green-800 border-green-200",
        cancelled: "bg-red-100 text-red-800 border-red-200"
    };
    const style = statusConfig[currentStatus] || "bg-stone-100 text-stone-800 border-stone-200";

    return (
        <select
            value={currentStatus}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={cn(
                "text-xs font-bold uppercase rounded-full px-3 py-1.5 border outline-none cursor-pointer transition-colors focus:ring-2 focus:ring-offset-1",
                style,
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
        </select>
    );
}