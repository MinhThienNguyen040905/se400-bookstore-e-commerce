// src/components/profile/OrderDetail.tsx
import type { Order } from '@/types/order';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, X, MapPin, Truck, Package } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { format } from 'date-fns';

interface OrderDetailProps {
    order: Order;
    onBack: () => void;
}

export function OrderDetail({ order, onBack }: OrderDetailProps) {
    const formatCurrency = (val: string) => Number(val).toLocaleString('en-US');
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd MMM yyyy, HH:mm');
        } catch {
            return dateString;
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-300">
            {/* 1. Header: Back Button & Order ID */}
            <div className="flex items-center gap-4 border-b border-stone-100 pb-4">
                <Button variant="ghost" size="icon" onClick={onBack} className="text-stone-500 hover:text-[#0df2d7]">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h2 className="text-xl font-bold font-display text-stone-900">Order #{order.order_id}</h2>
                    <p className="text-stone-500 text-sm">Placed on {formatDate(order.order_date)}</p>
                </div>
                <div className="ml-auto">
                    {/* Status Badge đơn giản ở header */}
                    <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                        order.status === 'delivered' ? "bg-green-100 text-green-700" :
                            order.status === 'cancelled' ? "bg-red-100 text-red-700" :
                                "bg-[#0df2d7]/20 text-stone-900"
                    )}>
                        {order.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COL: Items & Summary */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Order Items */}
                    <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
                        <div className="bg-stone-50 px-4 py-3 border-b border-stone-200">
                            <h3 className="font-bold text-stone-700 text-sm">Items ({order.order_items.length})</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            {order.order_items.map((item) => (
                                <div key={item.order_item_id} className="flex gap-4">
                                    <div className="h-20 w-14 flex-shrink-0 bg-stone-100 rounded overflow-hidden border border-stone-200">
                                        {item.book ? (
                                            <img src={item.book.cover_image} alt={item.book.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-200">
                                                <X className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-stone-900 text-sm line-clamp-2">
                                            {item.book ? item.book.title : <span className="text-red-500 italic">Sản phẩm không tồn tại</span>}
                                        </h4>
                                        <p className="text-stone-500 text-sm mt-1">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-stone-900">{formatPrice(item.price)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-lg border border-stone-200 p-4 space-y-3 text-sm">
                        <div className="flex justify-between text-stone-600">
                            <span>Subtotal</span>
                            <span>${formatCurrency(order.total_price)}</span>
                            {/* Lưu ý: Thực tế nên tính tổng item, ở đây lấy tạm total_price */}
                        </div>
                        <div className="flex justify-between text-stone-600">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        {order.promo && (
                            <div className="flex justify-between text-green-600 font-medium">
                                <span>Discount ({order.promo.code})</span>
                                <span>-{order.promo.discount_percent}%</span>
                            </div>
                        )}
                        <div className="border-t border-stone-100 pt-3 flex justify-between font-bold text-base text-stone-900">
                            <span>Total Paid</span>
                            <span className="text-[#00bbb6]">${formatCurrency(order.total_price)}</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT COL: Timeline (Status History) */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg border border-stone-200 p-6 sticky top-24">
                        <h3 className="font-display font-bold text-lg text-stone-900 mb-6 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-[#0df2d7]" /> Order Status
                        </h3>

                        <div className="relative pl-2">
                            {/* Vẽ Timeline */}
                            {order.status_history.map((step, index) => {
                                const isLast = index === order.status_history.length - 1;

                                return (
                                    <div key={index} className="relative pl-8 pb-8 last:pb-0">
                                        {/* Line connecting dots (chỉ vẽ nếu không phải phần tử cuối) */}
                                        {!isLast && (
                                            <div className={cn(
                                                "absolute left-[11px] top-3 bottom-0 w-0.5",
                                                step.isCompleted ? "bg-[#0df2d7]" : "bg-stone-200"
                                            )}></div>
                                        )}

                                        {/* Dot / Icon */}
                                        <div className={cn(
                                            "absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center border-2 z-10",
                                            step.isCompleted
                                                ? "bg-[#0df2d7] border-[#0df2d7] text-stone-900"
                                                : "bg-white border-stone-200 text-stone-300"
                                        )}>
                                            {step.status === 'cancelled' ? (
                                                <X className="w-3.5 h-3.5" />
                                            ) : (
                                                <Check className="w-3.5 h-3.5" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className={cn("mt-[-4px]", step.isCompleted ? "opacity-100" : "opacity-60")}>
                                            <h4 className={cn(
                                                "font-bold text-sm",
                                                step.isCompleted ? "text-stone-900" : "text-stone-500",
                                                step.status === 'cancelled' && "text-red-600"
                                            )}>
                                                {step.title}
                                            </h4>
                                            <p className="text-xs text-stone-500 mt-1">{step.description}</p>
                                            {step.completedAt && (
                                                <p className="text-xs font-medium text-[#00bbb6] mt-1">
                                                    {formatDate(step.completedAt)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Nếu đơn hủy, hiển thị thêm hộp cảnh báo */}
                        {order.status === 'cancelled' && (
                            <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded text-xs text-red-700">
                                This order has been cancelled. If you have any questions, please contact support.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}