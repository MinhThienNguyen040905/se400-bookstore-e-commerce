import type { RouteObject } from 'react-router-dom';
import Home from '@/pages/Home';
import BookDetailPage from '@/pages/BookDetailPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ResetPasswordFlow from '@/pages/ResetPasswordFlow';
import CartPage from '@/pages/CartPage';
import PaymentPage from '@/pages/PaymentPage';
import OrderSuccessPage from '@/pages/OrderSuccessPage';
import OrderFailurePage from '@/pages/OrderFailurePage';
import MyOrdersPage from '@/pages/MyOrdersPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminPage from '@/pages/AdminPage'; // Import trang admin
import ShopPage from '@/pages/ShopPage';
import AboutPage from '@/pages/AboutPage';
import CollectionPage from '@/pages/CollectionPage';

export const routes: RouteObject[] = [
    { path: '/', element: <Home /> },
    { path: '/book/:id', element: <BookDetailPage /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
    { path: '/reset-password', element: <ResetPasswordFlow /> },
    { path: '/cart', element: <CartPage /> },
    { path: '/checkout', element: <PaymentPage /> },
    { path: '/order-success', element: <OrderSuccessPage /> },
    { path: '/order-failure', element: <OrderFailurePage /> },
    { path: '/my-orders', element: <MyOrdersPage /> },
    { path: '/profile', element: <ProfilePage /> },
    { path: '/admin', element: <AdminPage /> }, // Thêm route admin
    { path: '/shop', element: <ShopPage /> },
    { path: '/about', element: <AboutPage /> },

    // --- CÁC ROUTE MỚI DÙNG CHUNG CollectionPage ---
    { path: '/new-releases', element: <CollectionPage type="new-releases" /> },
    { path: '/bestsellers', element: <CollectionPage type="bestsellers" /> },
    { path: '/deals', element: <CollectionPage type="deals" /> },
    { path: '/children-books', element: <CollectionPage type="children" /> },

    // Route cho thể loại động: /genre/1, /genre/5...
    { path: '/genre/:id', element: <CollectionPage type="genre" /> },
];