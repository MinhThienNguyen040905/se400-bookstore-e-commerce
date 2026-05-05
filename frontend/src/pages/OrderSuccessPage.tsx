// src/pages/OrderSuccessPage.tsx
import { Header } from '@/layouts/Header';
import { Footer } from '@/layouts/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Package, Truck, Clock, Home, AlertTriangle } from 'lucide-react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useEffect } from 'react';
import { formatPrice } from '@/lib/utils'; // Chỉ thêm import này

interface OrderData {
    order_id: number;
    total_price: string;
    status: string;
    payment_method: string;
    address: string;
    phone: string;
    order_date: string;
    PromoCode?: { code: string; discount_percent: string };
    OrderItems: Array<{
        quantity: number;
        price: string;
        Book: {
            title: string;
            cover_image: string;
        };
    }>;
}

export default function OrderSuccessPage() {
    const { state } = useLocation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const order: OrderData | null = state?.order || null;
    const { user } = useAuthStore();

    // VNPay redirect handling
    const vnpayCode = searchParams.get('code');
    const vnpayOrderId = searchParams.get('orderId');
    const vnpayTransactionNo = searchParams.get('transactionNo');

    useEffect(() => {
        // Nếu có code từ VNPay mà không phải '00' -> redirect đến failure page
        if (vnpayCode && vnpayCode !== '00') {
            navigate(`/order-failure?code=${vnpayCode}&orderId=${vnpayOrderId || ''}`);
        }
    }, [vnpayCode, vnpayOrderId, navigate]);

    // Nếu không có dữ liệu đơn hàng và không có vnpayCode → redirect về home
    if (!order && !vnpayCode) {
        return (
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Order information not found</h2>
                        <Button asChild>
                            <Link to="/">Back to Home</Link>
                        </Button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    const getPaymentMethodText = (method: string) => {
        switch (method) {
            case 'cash_on_delivery': return 'Cash on Delivery (COD)';
            case 'paypal': return 'PayPal';
            case 'credit_card': return 'Credit Card / Debit Card';
            default: return method;
        }
    };

    const getStatusBadge = (status: string) => {
        const map = {
            processing: { text: 'Processing', color: 'bg-yellow-100 text-yellow-800' },
            confirmed: { text: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
            shipping: { text: 'Shipping', color: 'bg-purple-100 text-purple-800' },
            completed: { text: 'Completed', color: 'bg-green-100 text-green-800' },
            cancelled: { text: 'Cancelled', color: 'bg-red-100 text-red-800' },
        };
        const item = map[status as keyof typeof map] || map.processing;
        return <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.color}`}>{item.text}</span>;
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="container mx-auto px-4 max-w-5xl">
                    {/* Success Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                            <CheckCircle2 className="w-12 h-12 text-green-600" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">
                            Order Placed Successfully!
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Thank you <strong>{user?.name || 'Customer'}</strong> for choosing B-World
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Your order number: <span className="font-bold text-purple-600">#{vnpayOrderId || order?.order_id}</span>
                        </p>
                        {vnpayCode === '00' && vnpayTransactionNo && (
                            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>VNPay payment successful • Transaction ID: {vnpayTransactionNo}</span>
                            </div>
                        )}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Order Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Details */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-purple-600" />
                                    Order Information
                                </h2>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Order ID</p>
                                        <p className="font-semibold">#{order.order_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Order Date</p>
                                        <p className="font-semibold">
                                            {format(new Date(order.order_date), 'dd/MM/yyyy HH:mm')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Status</p>
                                        {getStatusBadge(order.status)}
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Payment Method</p>
                                        <p className="font-semibold">{getPaymentMethodText(order.payment_method)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Ordered Items */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-semibold mb-4">Ordered Products</h2>
                                <div className="space-y-4">
                                    {order.OrderItems.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 pb-4 border-b last:border-0">
                                            <img
                                                src={item.Book.cover_image}
                                                alt={item.Book.title}
                                                className="w-16 h-20 object-cover rounded"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-medium">{item.Book.title}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Quantity: <strong>{item.quantity}</strong>
                                                </p>
                                            </div>
                                            <div className="text-right font-medium">
                                                {formatPrice((Number(item.price) * item.quantity).toString())}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Shipping Information */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-purple-600" />
                                    Shipping Information
                                </h2>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Recipient</p>
                                        <p className="font-semibold">{user?.name || 'Guest'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Phone Number</p>
                                        <p className="font-semibold">{order.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Shipping Address</p>
                                        <p className="font-medium">{order.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                                <h2 className="text-xl font-bold mb-6">Payment Summary</h2>

                                {order.PromoCode && (
                                    <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                        <p className="text-sm font-medium text-green-800">
                                            Applied promo code: <span className="font-bold">{order.PromoCode.code}</span>
                                        </p>
                                        <p className="text-xs text-green-700 mt-1">
                                            {order.PromoCode.discount_percent}% off
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-3 text-lg border-t pt-4">
                                    <div className="flex justify-between font-bold text-xl">
                                        <span>Total Payment</span>
                                        <span className="text-purple-600">
                                            {formatPrice(order.total_price)}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <Button asChild size="lg" className="w-full">
                                        <Link to="/my-orders">
                                            <Clock className="w-4 h-4 mr-2" />
                                            View Order History
                                        </Link>
                                    </Button>

                                    <Button asChild variant="outline" size="lg" className="w-full">
                                        <Link to="/">
                                            <Home className="w-4 h-4 mr-2" />
                                            Continue Shopping
                                        </Link>
                                    </Button>
                                </div>

                                <div className="mt-8 text-center text-sm text-muted-foreground">
                                    <p>We have sent a confirmation email to</p>
                                    <p className="font-medium text-purple-600">{user?.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}