import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { completeRegisterSchema, type CompleteRegisterData } from '@/schemas/otp.schema';
import { completeRegister } from '@/api/authApi';
import { showToast } from '@/lib/toast';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function CompleteRegisterForm({ email }: { email: string }) {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CompleteRegisterData>({
        resolver: zodResolver(completeRegisterSchema),
    });

    if (!email) {
        return <p className="text-destructive">Email không hợp lệ. Vui lòng quay lại bước đăng ký.</p>;
    }

    const onSubmit = async (data: CompleteRegisterData) => {
        const toastId = showToast.loading('Đang hoàn tất...');
        try {
            // Chỉ gửi các field cần thiết, bỏ confirmPassword
            await completeRegister({
                name: data.name,
                email,
                password: data.password,
            });
            showToast.dismiss(toastId);
            showToast.success('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (err: any) {
            showToast.dismiss(toastId);
            showToast.error(err.response?.data?.message || 'Đăng ký thất bại');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-stone-600 font-medium">Full Name</Label>
                <Input id="name" {...register('name')} className="h-12 border-stone-300 focus:border-[#0df2d7] focus:ring-[#0df2d7] rounded-lg" placeholder="Jane Doe" />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="password" className="text-stone-600 font-medium">Password</Label>
                <div className="relative">
                    <Input 
                        id="password" 
                        type={showPassword ? 'text' : 'password'} 
                        {...register('password')} 
                        className="h-12 border-stone-300 focus:border-[#0df2d7] focus:ring-[#0df2d7] rounded-lg pr-12" 
                        placeholder="Create a password" 
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
            <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-stone-600 font-medium">Confirm Password</Label>
                <div className="relative">
                    <Input 
                        id="confirmPassword" 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        {...register('confirmPassword')} 
                        className="h-12 border-stone-300 focus:border-[#0df2d7] focus:ring-[#0df2d7] rounded-lg pr-12" 
                        placeholder="Confirm password" 
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
            <Button type="submit" className="w-full h-12 bg-[#0df2d7] hover:bg-[#00dcc3] text-stone-900 font-bold text-base rounded-lg" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Complete Registration'}
            </Button>
        </form>
    );
}