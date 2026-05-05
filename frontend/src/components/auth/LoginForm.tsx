// src/components/auth/LoginForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/schemas/auth.schema';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

export function LoginForm() {
    const { login, isLoggingIn } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login({ email: data.email, password: data.password });
            navigate('/');
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="email" className="text-stone-600 font-medium">Email Address</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register('email')}
                    className="h-12 border-stone-300 focus:border-[#0df2d7] focus:ring-[#0df2d7] bg-white rounded-lg text-base"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                    <Label htmlFor="password" className="text-stone-600 font-medium">Password</Label>
                    <Link to="/reset-password" className="text-sm font-bold text-[#00bbb6] hover:text-[#0df2d7] hover:underline">
                        Forgot Password?
                    </Link>
                </div>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        {...register('password')}
                        className="h-12 border-stone-300 focus:border-[#0df2d7] focus:ring-[#0df2d7] bg-white rounded-lg text-base pr-12"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors focus:outline-none"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <Button
                type="submit"
                className="w-full h-12 bg-[#0df2d7] hover:bg-[#00dcc3] text-stone-900 font-bold text-base tracking-wide rounded-lg shadow-sm mt-2"
                disabled={isLoggingIn}
            >
                {isLoggingIn ? 'Logging in...' : 'Login'}
            </Button>
        </form>
    );
}