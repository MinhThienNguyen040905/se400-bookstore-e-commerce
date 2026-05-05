// src/pages/MyOrdersPage.tsx
import { useState } from 'react';
import { Header } from '@/layouts/Header';
import { Footer } from '@/layouts/Footer';
import { Button } from '@/components/ui/button';
import { Package, Truck, CheckCircle, X, Clock, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getMyOrders } from '@/api/orderApi';
import type { Order, OrderTimeline } from '@/types/order';
import { format } from 'date-fns';
import { ReviewModal } from '@/components/reviews/ReviewModal';
import { formatPrice } from '@/lib/utils'; // Sử dụng formatPrice chung

export default function MyOrdersPage() {
    const [reviewModal, setReviewModal] = useState<{
        open: boolean;
        bookId: number;
        bookTitle: string;
        bookCover: string;
    }>({
        open: false,
        bookId: 0,
        bookTitle: '',
        bookCover: ''
    });

    const { data: orders, isLoading, error } = useQuery<Order[]>({
        queryKey: ['orders', 'my-orders'],
        queryFn: getMyOrders,
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'processing':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'shipped':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'processing':
                return 'Processing';
            case 'shipped':
                return 'Shipped';
            case 'delivered':
                return 'Delivered';
            case 'cancelled':
                return 'Cancelled';
            default:
                return status;
        }
    };

    const getStepIcon = (status: string) => {
        switch (status) {
            case 'processing':
                return Package;
            case 'shipped':
                return Truck;
            case 'delivered':
                return CheckCircle;
            default:
                return Clock;
        }
    };

    const openReviewModal = (bookId: number, bookTitle: string, bookCover: string) => {
        setReviewModal({
            open: true,
            bookId,
            bookTitle,
            bookCover
        });
    };

    if (isLoading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-50 py-12">
                    <div className="container mx-auto px-4">
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
                    <div className="text-center">
                        <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Error loading data</h2>
                        <p className="text-gray-600">Unable to load your orders</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h1 className="text-3xl font-bold mb-8">My Orders</h1>

                    {!orders || orders.length === 0 ? (
                        <div className="bg-white rounded-lg p-12 text-center">
                            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
                            <p className="text-gray-600 mb-6">
                                You haven't placed any orders yet. Start shopping now!
                            </p>
                            <Button asChild>
                                <a href="/">Explore Books</a>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <div key={order.order_id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    {/* Order Header */}
                                    <div className="p-6 border-b bg-gray-50">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold">
                                                        Order #{order.order_id}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                                                        {getStatusText(order.status)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Placed on {format(new Date(order.order_date), 'MMM dd, yyyy HH:mm')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Total Amount</p>
                                                <p className="text-xl font-bold text-purple-600">
                                                    {formatPrice(order.total_price)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline - Only show if not cancelled */}
                                    {order.status !== 'cancelled' && order.status_history && (
                                        <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
                                            <h4 className="text-sm font-semibold mb-4 text-gray-700">Order Status</h4>
                                            <div className="relative">
                                                <div className="space-y-4">
                                                    {order.status_history.map((step: OrderTimeline, index: number) => {
                                                        const Icon = getStepIcon(step.status);
                                                        const isLast = index === order.status_history.length - 1;

                                                        return (
                                                            <div key={step.status} className="relative flex items-start gap-4">
                                                                {/* Connector Line */}
                                                                {!isLast && (
                                                                    <div className={`absolute left-4 top-10 w-0.5 h-full ${step.isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                                )}

                                                                {/* Icon */}
                                                                <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${step.isCompleted
                                                                        ? 'bg-green-500 text-white'
                                                                        : 'bg-gray-300 text-gray-600'
                                                                    }`}>
                                                                    <Icon className="w-4 h-4" />
                                                                </div>

                                                                {/* Content */}
                                                                <div className="flex-1 pb-4">
                                                                    <h5 className={`font-semibold ${step.isCompleted ? 'text-green-700' : 'text-gray-600'}`}>
                                                                        {step.title}
                                                                    </h5>
                                                                    <p className="text-sm text-gray-600">{step.description}</p>
                                                                    {step.completedAt && (
                                                                        <p className="text-xs text-gray-500 mt-1">
                                                                            {format(new Date(step.completedAt), 'MMM dd, yyyy HH:mm')}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Order Items */}
                                    <div className="p-6">
                                        <h4 className="text-sm font-semibold mb-4 text-gray-700">Items</h4>
                                        <div className="space-y-4">
                                            {order.order_items.map((item) => (
                                                <div key={item.order_item_id} className="flex gap-4 items-center">
                                                    <img
                                                        src={item.book?.cover_image || '/placeholder.png'}
                                                        alt={item.book?.title || 'Book'}
                                                        className="w-16 h-20 object-cover rounded"
                                                    />
                                                    <div className="flex-1">
                                                        <h5 className="font-medium">{item.book?.title || 'Book not found'}</h5>
                                                        <p className="text-sm text-gray-600">
                                                            Quantity: {item.quantity} × {formatPrice(item.price)}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <p className="font-semibold">
                                                            {formatPrice(Number(item.price) * item.quantity)}
                                                        </p>
                                                        {/* Review Button - Only show if order is delivered */}
                                                        {order.status === 'delivered' && item.book && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => openReviewModal(
                                                                    item.book!.book_id,
                                                                    item.book!.title,
                                                                    item.book!.cover_image
                                                                )}
                                                                className="gap-2"
                                                            >
                                                                <Star className="w-4 h-4" />
                                                                Write a Review
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {order.promo && (
                                            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                                <p className="text-sm text-green-800">
                                                    <strong>Promo Code:</strong> {order.promo.code} (-{order.promo.discount_percent}%)
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Review Modal */}
            <ReviewModal
                open={reviewModal.open}
                onOpenChange={(open) => setReviewModal({ ...reviewModal, open })}
                bookId={reviewModal.bookId}
                bookTitle={reviewModal.bookTitle}
                bookCover={reviewModal.bookCover}
            />

            <Footer />
        </>
    );
}