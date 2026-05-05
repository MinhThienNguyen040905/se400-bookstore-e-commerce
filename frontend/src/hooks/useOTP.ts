import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestOTP, verifyOTP } from '@/api/authApi';
import { showToast } from '@/lib/toast';

export const useOTP = () => {
    const queryClient = useQueryClient();

    const request = useMutation({
        mutationFn: (email: string) => requestOTP(email),
        onMutate: () => {
            const toastId = showToast.loading('Đang gửi OTP...');
            return { toastId };
        },
        onSuccess: (_data, email) => {
            queryClient.setQueryData(['otp-email'], email);
            showToast.success('Đã gửi OTP');
        },
        onError: (_err, _vars, context) => {
            if (context?.toastId) showToast.dismiss();
            showToast.error('Gửi OTP thất bại');
        },
    });

    const verify = useMutation({
        mutationFn: ({ email, otp }: { email: string; otp: string }) => verifyOTP(email, otp),
        onMutate: () => {
            const toastId = showToast.loading('Đang xác thực...');
            return { toastId };
        },
        onSuccess: () => {
            showToast.success('Xác thực thành công');
        },
        onError: (_err, _vars, context) => {
            if (context?.toastId) showToast.dismiss();
            showToast.error('OTP sai hoặc hết hạn');
        },
    });

    return { request, verify };
};