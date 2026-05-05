import { useMutation } from '@tanstack/react-query';
import { login, logout, updateProfile, changePassword } from '@/api/authApi';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { showToast } from '@/lib/toast';

export const useAuth = () => {
    const { setAccessToken, setUser, updateUser, clearAuth, user } = useAuthStore();

    const loginMutation = useMutation({
        mutationFn: ({ email, password }: { email: string; password: string }) =>
            login(email, password),
        onMutate: () => {
            const toastId = showToast.loading('Logging in...');
            return { toastId };
        },
        onSuccess: (data) => {
            console.log('Login mutation success:', data);
            const { accessToken, user } = data;
            setAccessToken(accessToken);
            setUser(user);
            showToast.success('Login successful!');
        },
        onError: (_err, _vars, context) => {
            showToast.dismiss(context?.toastId);
            showToast.error('Login failed, Incorrect email or password');
        },
    });

    const logoutMutation = useMutation({
        mutationFn: logout,
        onMutate: () => {
            const toastId = showToast.loading('Logging out...');
            return { toastId };
        },
        onSuccess: () => {
            clearAuth();
            showToast.success('Logout successful');
        },
        onError: (_err, _vars, context) => {
            showToast.dismiss(context?.toastId);
            showToast.error('Logout error');
            clearAuth();
        },
    });

    // Mutation to update profile
    const updateProfileMutation = useMutation({
        mutationFn: updateProfile,
        onMutate: () => {
            return { toastId: showToast.loading('Updating profile...') };
        },
        onSuccess: (data, variables, context) => {
            const updatedUser = data.data || data;

            updateUser(updatedUser);

            showToast.dismiss(context?.toastId);
            showToast.success('Profile updated successfully!');
        },
        onError: (err: any, variables, context) => {
            showToast.dismiss(context?.toastId);
            showToast.error(err.response?.data?.message || 'Update failed');
        },
    });

    // Mutation to change password
    const changePasswordMutation = useMutation({
        mutationFn: changePassword,
        onMutate: () => {
            return { toastId: showToast.loading('Changing password...') };
        },
        onSuccess: (data, variables, context) => {
            showToast.dismiss(context?.toastId);
            showToast.success('Password changed successfully!');
        },
        onError: (err: any, variables, context) => {
            showToast.dismiss(context?.toastId);
            showToast.error(err.response?.data?.message || 'Password change failed');
        },
    });

    return {
        login: loginMutation.mutateAsync,
        logout: logoutMutation.mutate,
        isLoggingIn: loginMutation.isPending,
        isLoggingOut: logoutMutation.isPending,
        user,
        updateProfile: updateProfileMutation.mutate,
        isUpdating: updateProfileMutation.isPending,

        changePassword: changePasswordMutation.mutateAsync, // Use mutateAsync for await handling in UI
        isChangingPassword: changePasswordMutation.isPending,
    };
};