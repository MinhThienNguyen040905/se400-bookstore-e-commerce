// src/pages/OrderFailurePage.tsx
import { Header } from '@/layouts/Header';
import { Footer } from '@/layouts/Footer';
import { Button } from '@/components/ui/button';
import { XCircle, Home, ShoppingCart } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export default function OrderFailurePage() {
    const [searchParams] = useSearchParams();
    const responseCode = searchParams.get('code');
    const orderId = searchParams.get('orderId');
    const message = searchParams.get('message');

    const getErrorMessage = (code: string | null) => {
        switch (code) {
            case '07':
                return 'Transaction suspected of fraud or abnormal activity.';
            case '09':
                return 'Card/Account has not registered for Internet Banking service at the bank.';
            case '10':
                return 'Card/Account authentication failed more than 3 times.';
            case '11':
                return 'Payment timeout. Please try the transaction again.';
            case '12':
                return 'Your card/account is locked.';
            case '13':
                return 'Incorrect transaction authentication password (OTP).';
            case '24':
                return 'You have cancelled the transaction.';
            case '51':
                return 'Insufficient account balance to complete the transaction.';
            case '65':
                return 'Account has exceeded the daily transaction limit.';
            case '75':
                return 'Payment bank is under maintenance.';
            case '79':
                return 'Incorrect payment password entered too many times.';
            case '97':
                return 'Invalid signature.';
            case '01':
                return 'Order not found.';
            case '99':
                return message || 'System error. Please try again later.';
            default:
                return 'Transaction failed. Please try again.';
        }
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="container mx-auto px-4 max-w-2xl">
                    {/* Error Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
                            <XCircle className="w-12 h-12 text-red-600" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">
                            Payment Failed!
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            We're sorry, your transaction was not successful
                        </p>
                    </div>

                    {/* Error Details */}
                    <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                        <div className="space-y-4">
                            {orderId && (
                                <div className="flex justify-between items-center border-b pb-3">
                                    <span className="text-muted-foreground">Order ID:</span>
                                    <span className="font-semibold text-purple-600">#{orderId}</span>
                                </div>
                            )}

                            {responseCode && (
                                <div className="flex justify-between items-center border-b pb-3">
                                    <span className="text-muted-foreground">Error Code:</span>
                                    <span className="font-semibold text-red-600">{responseCode}</span>
                                </div>
                            )}

                            <div className="pt-2">
                                <p className="text-sm text-muted-foreground mb-2">Reason:</p>
                                <p className="font-medium text-gray-900">
                                    {getErrorMessage(responseCode)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4">What you can do:</h2>
                        <div className="space-y-3">
                            <Button asChild size="lg" className="w-full">
                                <Link to="/cart">
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Back to Cart
                                </Link>
                            </Button>

                            <Button asChild variant="outline" size="lg" className="w-full">
                                <Link to="/">
                                    <Home className="w-4 h-4 mr-2" />
                                    Back to Home
                                </Link>
                            </Button>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-800">
                                💡 <strong>Tip:</strong> If you're having trouble with payment, please check your card details again or contact your bank for assistance.
                            </p>
                        </div>
                    </div>

                    {/* Support Info */}
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        <p>Need help? Contact us:</p>
                        <p className="font-medium text-purple-600 mt-1">
                            Email: support@b-world.com | Hotline: 1900-xxxx
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}