// src/lib/toast.ts
import { toast } from 'sonner';

let currentToastId: string | number | null = null;

export const showToast = {
    loading: (msg: string) => {
        if (currentToastId) toast.dismiss(currentToastId);
        currentToastId = toast.loading(msg);
        return currentToastId;
    },
    success: (msg: string) => {
        if (currentToastId) toast.dismiss(currentToastId);
        currentToastId = toast.success(msg);
    },
    error: (msg: string) => {
        if (currentToastId) toast.dismiss(currentToastId);
        currentToastId = toast.error(msg);
    },
    dismiss: () => {
        if (currentToastId) {
            toast.dismiss(currentToastId);
            currentToastId = null;
        }
    },
};