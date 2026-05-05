import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestOTPSchema, type RequestOTPData } from '@/schemas/otp.schema';
import { useOTP } from '@/hooks/useOTP';

export default function ResetRequestOTPForm({ onSuccess }: { onSuccess?: (email: string) => void }) {
    const { request } = useOTP();
    const { register, handleSubmit, formState: { errors } } = useForm<RequestOTPData>({
        resolver: zodResolver(requestOTPSchema),
    });

    const onSubmit = (data: RequestOTPData) => {
        request.mutate(data.email, {
            onSuccess: () => onSuccess?.(data.email),
        });
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
            <Button
                type="submit"
                className="w-full h-12 bg-[#0df2d7] hover:bg-[#00dcc3] text-stone-900 font-bold text-base tracking-wide rounded-lg shadow-sm"
                disabled={request.isPending}
            >
                {request.isPending ? 'Sending...' : 'Send OTP Code'}
            </Button>
        </form>
    );
}