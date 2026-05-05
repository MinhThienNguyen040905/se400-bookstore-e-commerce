// src/pages/ResetPasswordFlow.tsx
import { useState } from 'react';
import ResetRequestOTPForm from '@/components/auth/reset/ResetRequestOTPForm';
import ResetVerifyOTPForm from '@/components/auth/reset/ResetVerifyOTPForm';
import ResetPasswordCompleteForm from '@/components/auth/reset/ResetPasswordCompleteForm';
import { AuthLayout } from '@/layouts/AuthLayout';

export default function ResetPasswordFlow() {
    const [step, setStep] = useState<'request' | 'verify' | 'complete'>('request');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');

    const handleRequestSuccess = (email: string) => {
        setEmail(email);
        setStep('verify');
    };

    const handleVerifySuccess = (otp: string) => {
        setOtp(otp);
        setStep('complete');
    };

    let title = "Reset Password";
    let subtitle = "Enter your email to reset password.";

    if (step === 'verify') subtitle = "Enter the code sent to your email.";
    if (step === 'complete') subtitle = "Create your new password.";

    return (
        <AuthLayout title={title} subtitle={subtitle} showTabs={false}>
            {step === 'request' && <ResetRequestOTPForm onSuccess={handleRequestSuccess} />}
            {step === 'verify' && <ResetVerifyOTPForm email={email} onSuccess={handleVerifySuccess} />}
            {step === 'complete' && <ResetPasswordCompleteForm email={email} otp={otp} />}
        </AuthLayout>
    );
}