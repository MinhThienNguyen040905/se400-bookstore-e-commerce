// src/components/admin/orders/OrderModal.tsx
import { useAdminOrderDetail } from '@/hooks/useAdminOrders';
import { X, User, MapPin, Phone, CreditCard, Calendar, Package, Loader2, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { cn, formatPrice } from '@/lib/utils';

interface OrderModalProps {
    orderId: number | null;
    onClose: () => void;
}

export function OrderModal({ orderId, onClose }: OrderModalProps) {
    const { data: order, isLoading, isError } = useAdminOrderDetail(orderId);

    if (!orderId) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-stone-100 bg-stone-50">
                    <div>
                        <h2 className="text-xl font-bold font-display text-stone-900">
                            Order Details #{orderId}
                        </h2>
                        {order && (
                            <p className="text-sm text-stone-500 mt-1">
                                Placed on {format(new Date(order.order_date), 'dd MMM yyyy, HH:mm')}
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full text-stone-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafc]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-stone-400">
                            <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#0df2d7]" />
                            <p>Loading order details...</p>
                        </div>
                    ) : isError || !order ? (
                        <div className="text-center text-red-500 py-10">Failed to load order details.</div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* LEFT COLUMN: Main Info */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* 1. Order Items */}
                                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                                    <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-[#009b8f]" /> Ordered Items
                                    </h3>
                                    <div className="space-y-4">
                                        {order.items.map((item) => (
                                            <div key={item.order_item_id} className="flex gap-4 border-b border-stone-50 last:border-0 last:pb-0 pb-4">
                                                <div className="h-20 w-14 bg-stone-100 rounded overflow-hidden flex-shrink-0 border border-stone-200">
                                                    <img src={item.book.cover_image} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-stone-900 text-sm line-clamp-2">{item.book.title}</h4>
                                                    <div className="flex justify-between items-end mt-2">
                                                        <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                                                        <p className="font-bold text-stone-900 text-sm">
                                                            {formatPrice(item.price)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Summary Footer */}
                                    <div className="mt-4 pt-4 border-t border-stone-100 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-stone-500">Payment Method</span>
                                            <span className="font-medium capitalize">{order.payment_method.replace('_', ' ')}</span>
                                        </div>
                                        {order.promo && (
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span>Discount ({order.promo.code})</span>
                                                <span>-{order.promo.discount_percent}%</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-base font-bold text-stone-900 pt-2">
                                            <span>Total Amount</span>
                                            <span className="text-[#009b8f]">{formatPrice(order.total_price)}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* RIGHT COLUMN: Customer & Status */}
                            <div className="space-y-6">

                                {/* 2. Customer Info */}
                                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                                    <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5 text-[#009b8f]" /> Customer
                                    </h3>
                                    <div className="space-y-3 text-sm text-stone-600">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5"><User className="w-4 h-4 text-stone-400" /></div>
                                            <div>
                                                <p className="font-bold text-stone-900">{order.user.name}</p>
                                                <p className="text-xs">{order.user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5"><Phone className="w-4 h-4 text-stone-400" /></div>
                                            <p>{order.phone || order.user.phone}</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5"><MapPin className="w-4 h-4 text-stone-400" /></div>
                                            <p className="line-clamp-3">{order.address || order.user.address}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Status Timeline (Nếu backend trả về status_history) */}
                                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                                    <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-[#009b8f]" /> Status History
                                    </h3>

                                    {order.status_history ? (
                                        <div className="relative pl-2 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-100">
                                            {order.status_history.map((step, idx) => (
                                                <div key={idx} className="relative pl-8">
                                                    <div className={cn(
                                                        "absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white z-10",
                                                        step.isCompleted ? "border-[#0df2d7] text-[#009b8f]" : "border-stone-200"
                                                    )}>
                                                        <div className={cn("w-2 h-2 rounded-full", step.isCompleted ? "bg-[#0df2d7]" : "bg-stone-200")}></div>
                                                    </div>
                                                    <div>
                                                        <p className={cn("text-sm font-bold", step.isCompleted ? "text-stone-900" : "text-stone-400")}>
                                                            {step.title}
                                                        </p>
                                                        <p className="text-xs text-stone-500">{step.description}</p>
                                                        {step.completedAt && (
                                                            <p className="text-[10px] text-[#009b8f] mt-1 font-medium">
                                                                {format(new Date(step.completedAt), 'dd MMM HH:mm')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        // Fallback nếu không có history: Chỉ hiện status hiện tại
                                        <div className="p-3 bg-[#0df2d7]/10 text-[#009b8f] rounded-lg text-center font-bold capitalize border border-[#0df2d7]/20">
                                            {order.status}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-stone-100 bg-stone-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 font-bold transition-colors"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}