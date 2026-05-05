// src/pages/PaymentPage.tsx
import { useState } from 'react';
import { Header } from '@/layouts/Header';
import { Footer } from '@/layouts/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCartQuery } from '@/hooks/useCartQuery';
import { useCheckPromo } from '@/hooks/usePromo';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, Truck, CreditCard } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder } from '@/api/orderApi';
import { useVNPayPayment } from '@/hooks/useVNPayPayment';
import { useCartStore } from '@/features/cart/useCartStore';
import type { PromoResponse } from '@/api/orderApi';
import { AxiosError } from 'axios';
import { formatPrice } from '@/lib/utils'; // Thêm import formatPrice

export default function PaymentPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { data: cartData } = useCartQuery();
    const items = cartData?.items || [];
    const subtotal = cartData?.total_price || 0;

    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState<PromoResponse | null>(null);

    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPay'>('COD');

    const [address, setAddress] = useState(user?.address || '');
    const [phone, setPhone] = useState(user?.phone || '');

    const checkPromo = useCheckPromo();
    const queryClient = useQueryClient();
    const clearCart = useCartStore((s) => s.clearCart);

    const vnpayPayment = useVNPayPayment();

    const createOrderMutation = useMutation({
        mutationFn: createOrder,
        onSuccess: (res) => {
            showToast.success(res.message || 'Order placed successfully!');
            clearCart();
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            navigate('/order-success', { state: { order: res.data } });
        },
        onError: (err: AxiosError<{ message: string }>) => {
            showToast.error(err.response?.data?.message || 'Failed to place order');
        },
    });

    if (!items.length) {
        return (
            <div className="flex flex-col min-h-screen bg-[#f5f8f8]">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold font-display text-stone-900 mb-4">Your cart is empty</h2>
                        <Link to="/">
                            <Button className="bg-[#0df2d7] text-stone-900 font-bold">Continue Shopping</Button>
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const finalPrice = appliedPromo ? appliedPromo.final_price : subtotal;

    const handleApplyPromo = () => {
        if (!promoCode.trim()) return showToast.error('Please enter a promo code');
        checkPromo.mutate(
            { code: promoCode, total_price: subtotal },
            { onSuccess: (data) => setAppliedPromo(data) }
        );
    };

    const handlePlaceOrder = () => {
        if (!address.trim() || !phone.trim()) {
            return showToast.error('Please enter your address and phone number');
        }

        if (paymentMethod === 'COD') {
            createOrderMutation.mutate({
                promo_code: appliedPromo?.code,
                payment_method: 'COD',
                address,
                phone,
            });
        } else if (paymentMethod === 'VNPay') {
            vnpayPayment.mutate({
                amount: finalPrice,
                address,
                phone,
                promo_code: appliedPromo?.code,
            });
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f5f8f8]">
            <Header />
            <main className="container mx-auto px-4 py-8 sm:py-12 flex-1">
                <div className="flex flex-col gap-6">
                    {/* Breadcrumbs */}
                    <div className="flex flex-wrap gap-2 text-sm mb-2">
                        <Link to="/cart" className="text-stone-500 hover:text-[#0df2d7] font-medium flex items-center gap-1">
                            <ArrowLeft className="w-3 h-3" /> Back to Cart
                        </Link>
                        <span className="text-stone-400">/</span>
                        <span className="text-stone-900 font-medium">Checkout</span>
                    </div>

                    <h1 className="font-display text-4xl font-black tracking-tighter text-stone-900">Checkout</h1>

                    <div className="grid lg:grid-cols-3 gap-8 xl:gap-12 items-start">
                        {/* LEFT COLUMN: Inputs */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Shipping Info */}
                            <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200 shadow-sm">
                                <h2 className="text-xl font-bold font-display text-stone-900 mb-6 flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-[#00bbb6]" /> Shipping Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-stone-600 font-medium">Full Name</Label>
                                        <Input id="name" value={user?.name} disabled className="bg-stone-50 border-stone-200 text-stone-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-stone-600 font-medium">Email</Label>
                                        <Input id="email" value={user?.email} disabled className="bg-stone-50 border-stone-200 text-stone-500" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="address" className="text-stone-900 font-medium">Address <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="address"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="Enter your shipping address"
                                            className="h-11 border-stone-200 focus:border-[#0df2d7] focus:ring-[#0df2d7]"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="phone" className="text-stone-900 font-medium">Phone Number <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="phone"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="Enter your phone number"
                                            className="h-11 border-stone-200 focus:border-[#0df2d7] focus:ring-[#0df2d7]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200 shadow-sm">
                                <h2 className="text-xl font-bold font-display text-stone-900 mb-6 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-[#00bbb6]" /> Payment Method
                                </h2>
                                <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'COD' | 'VNPay')} className="space-y-4">

                                    {/* Option 1: COD */}
                                    <div
                                        className={`flex items-center space-x-4 border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-[#0df2d7] bg-[#f0fdfd]' : 'border-stone-200 hover:bg-stone-50'
                                            }`}
                                        onClick={() => setPaymentMethod('COD')}
                                    >
                                        <RadioGroupItem value="COD" id="cod" className="text-[#0df2d7] border-stone-400" />
                                        <Label htmlFor="cod" className="flex-1 cursor-pointer font-medium text-stone-900 flex items-center gap-2">
                                            <Truck className="w-5 h-5 text-stone-500" />
                                            Cash on Delivery (COD)
                                        </Label>
                                    </div>

                                    {/* Option 2: VNPay */}
                                    <div
                                        className={`flex items-center space-x-4 border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === 'VNPay' ? 'border-[#0df2d7] bg-[#f0fdfd]' : 'border-stone-200 hover:bg-stone-50'
                                            }`}
                                        onClick={() => setPaymentMethod('VNPay')}
                                    >
                                        <RadioGroupItem value="VNPay" id="vnpay" className="text-[#0df2d7] border-stone-400" />
                                        <Label htmlFor="vnpay" className="flex-1 cursor-pointer font-medium text-stone-900 flex items-center gap-2">
                                            <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center bg-white border border-stone-100">
                                                <img src="https://vnpay.vn/assets/images/logo-icon/logo-primary.svg" alt="VNPay" className="w-full h-full object-contain" />
                                            </div>
                                            Pay with VNPay (ATM / QR Code)
                                        </Label>
                                    </div>

                                </RadioGroup>
                            </div>

                            {/* Order Review (Items) */}
                            <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200 shadow-sm">
                                <h2 className="text-xl font-bold font-display text-stone-900 mb-6">Review Items</h2>
                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div key={item.book_id} className="flex gap-4 border-b border-stone-100 pb-4 last:border-0 last:pb-0">
                                            <img src={item.cover_image} alt={item.title} className="w-16 h-20 object-cover rounded bg-stone-100" />
                                            <div className="flex-1">
                                                <h4 className="font-bold text-stone-900 font-display">{item.title}</h4>
                                                <p className="text-sm text-stone-500">{item.authors}</p>
                                                <p className="text-sm text-stone-600 mt-1">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-bold text-stone-900">{formatPrice(item.price * item.quantity)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Summary */}
                        <div className="lg:col-span-1 w-full">
                            <div className="bg-white rounded-lg border border-stone-200 p-6 flex flex-col gap-6 sticky top-24 shadow-sm">
                                <h3 className="font-display text-xl font-bold text-stone-900">Order Summary</h3>

                                {/* Promo Code Input */}
                                <div className="flex flex-col gap-2">
                                    <Label className="text-sm font-medium text-stone-600">Promo Code</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Enter code"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value)}
                                            className="bg-[#f5f8f8] border-stone-200 focus:ring-[#0df2d7] focus:border-[#0df2d7]"
                                        />
                                        <Button
                                            onClick={handleApplyPromo}
                                            disabled={checkPromo.isPending || !promoCode.trim()}
                                            className="bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200 font-bold"
                                        >
                                            Apply
                                        </Button>
                                    </div>
                                    {appliedPromo && (
                                        <div className="text-sm text-green-600 bg-green-50 p-2 rounded flex items-center gap-1 mt-1 border border-green-100">
                                            <Tag className="w-3 h-3" /> Code <strong>{appliedPromo.code}</strong> applied: -{formatPrice(appliedPromo.discount_amount)}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col border-b border-stone-200 pb-4 border-t border-stone-100 pt-4">
                                    <div className="flex justify-between gap-x-6 py-2">
                                        <p className="text-stone-600 text-sm">Subtotal</p>
                                        <p className="text-stone-900 text-sm font-medium text-right">{formatPrice(subtotal)}</p>
                                    </div>
                                    {appliedPromo && (
                                        <div className="flex justify-between gap-x-6 py-2 text-green-600">
                                            <p className="text-sm">Discount</p>
                                            <p className="text-sm font-medium text-right">-{formatPrice(appliedPromo.discount_amount)}</p>
                                        </div>
                                    )}
                                    <div className="flex justify-between gap-x-6 py-2">
                                        <p className="text-stone-600 text-sm">Shipping</p>
                                        <p className="text-stone-900 text-sm font-medium text-right">Free</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center gap-x-6">
                                    <p className="font-display font-bold text-lg text-stone-900">Total</p>
                                    <p className="font-display text-2xl font-bold text-right text-[#00bbb6]">
                                        {formatPrice(finalPrice)}
                                    </p>
                                </div>

                                <Button
                                    onClick={handlePlaceOrder}
                                    disabled={createOrderMutation.isPending || vnpayPayment.isPending}
                                    className="w-full h-12 bg-[#0df2d7] hover:bg-[#00dcc3] text-stone-900 font-bold text-base tracking-wide rounded-lg shadow-sm"
                                >
                                    {createOrderMutation.isPending || vnpayPayment.isPending
                                        ? 'Processing...'
                                        : (paymentMethod === 'VNPay' ? 'Pay with VNPay' : 'Place Order (COD)')}
                                </Button>

                                <p className="text-xs text-center text-stone-500">
                                    By placing your order, you agree to our Terms of Service.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}