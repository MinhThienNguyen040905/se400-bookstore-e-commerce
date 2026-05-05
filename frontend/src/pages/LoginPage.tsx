// src/pages/LoginPage.tsx
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthLayout } from '@/layouts/AuthLayout';

export default function LoginPage() {
    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Login to continue your literary journey."
        >
            <LoginForm />
        </AuthLayout>
    );
}