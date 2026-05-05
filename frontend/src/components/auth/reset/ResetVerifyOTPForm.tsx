import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { verifyOTPSchema, type VerifyOTPData } from '@/schemas/otp.schema';
import { useOTP } from '@/hooks/useOTP';

export default function ResetVerifyOTPForm({
    email,
    onSuccess,
}: {
    email: string;
    onSuccess?: (otp: string) => void;
}) {
    const { verify } = useOTP();
    const { register, handleSubmit, formState: { errors } } = useForm<VerifyOTPData>({
        resolver: zodResolver(verifyOTPSchema),
        defaultValues: { email },
    });

    const onSubmit = (data: VerifyOTPData) => {
        verify.mutate(data, {
            onSuccess: () => onSuccess?.(data.otp),
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="text-center p-4 bg-stone-50 rounded-lg border border-stone-100 mb-2">
                <p className="text-sm text-stone-500">OTP sent to</p>
                <p className="font-bold text-stone-900">{email}</p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="otp" className="text-stone-600 font-medium">Enter OTP Code</Label>
                <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    {...register('otp')}
                    className="h-12 border-stone-300 focus:border-[#0df2d7] focus:ring-[#0df2d7] bg-white text-center text-lg tracking-widest rounded-lg"
                />
                {errors.otp && <p className="text-sm text-red-500">{errors.otp.message}</p>}
            </div>
            <Button
                type="submit"
                className="w-full h-12 bg-[#0df2d7] hover:bg-[#00dcc3] text-stone-900 font-bold text-base tracking-wide rounded-lg shadow-sm"
                disabled={verify.isPending}
            >
                {verify.isPending ? 'Verifying...' : 'Verify OTP'}
            </Button>
        </form>
    );
}