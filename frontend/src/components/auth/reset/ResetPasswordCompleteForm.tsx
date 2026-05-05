import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetPasswordSchema, type ResetPasswordData } from '@/schemas/otp.schema';
import { resetPassword } from '@/api/authApi';
import { showToast } from '@/lib/toast';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordCompleteForm({ email, otp }: { email: string; otp: string }) {
    const navigate = useNavigate();
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // 1. SỬA LỖI HOOK: Gọi useForm TRƯỚC khi return
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordData>({
        resolver: zodResolver(resetPasswordSchema),
        // Thêm defaultValues để form nhận diện được email và otp ngay từ đầu
        defaultValues: {
            email: email,
            otp: otp,
            newPassword: '',
            confirmPassword: ''
        }
    });

    // 2. Di chuyển đoạn kiểm tra điều kiện xuống dưới Hook
    if (!email || !otp) {
        return <p className="text-red-500 text-center">Invalid Data. Please restart the process.</p>;
    }

    const onSubmit = async (data: ResetPasswordData) => {
        const toastId = showToast.loading('Updating password...');
        try {
            await resetPassword({
                email, // Lấy từ props hoặc data.email
                otp,   // Lấy từ props hoặc data.otp
                newPassword: data.newPassword,
            });
            showToast.dismiss(toastId);
            showToast.success('Password updated successfully! Please login.');
            navigate('/login');
        } catch (err: any) {
            showToast.dismiss(toastId);
            const errorMessage = err.response?.data?.message || 'Failed to update password';
            showToast.error(errorMessage);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Đăng ký các trường ẩn để Zod validation hoạt động đúng */}
            <input type="hidden" {...register('email')} />
            <input type="hidden" {...register('otp')} />

            <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-stone-600 font-medium">New Password</Label>
                <div className="relative">
                    <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        {...register('newPassword')}
                        className="h-12 border-stone-300 focus:border-[#0df2d7] focus:ring-[#0df2d7] bg-white rounded-lg pr-12"
                    />
                    <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors focus:outline-none"
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                        {showNewPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                </div>
                {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-stone-600 font-medium">Confirm Password</Label>
                <div className="relative">
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        {...register('confirmPassword')}
                        className="h-12 border-stone-300 focus:border-[#0df2d7] focus:ring-[#0df2d7] bg-white rounded-lg pr-12"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors focus:outline-none"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>
            <Button
                type="submit"
                className="w-full h-12 bg-[#0df2d7] hover:bg-[#00dcc3] text-stone-900 font-bold text-base tracking-wide rounded-lg shadow-sm"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Updating...' : 'Reset Password'}
            </Button>
        </form>
    );
}