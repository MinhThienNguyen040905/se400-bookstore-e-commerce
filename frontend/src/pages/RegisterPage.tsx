// src/pages/RegisterPage.tsx
import { useState } from 'react';
import RegisterRequestOTPForm from '@/components/auth/register/RegisterRequestOTPForm';
import RegisterVerifyOTPForm from '@/components/auth/register/RegisterVerifyOTPForm';
import CompleteRegisterForm from '@/components/auth/register/CompleteRegisterForm';
import { AuthLayout } from '@/layouts/AuthLayout';

export default function RegisterPage() {
    const [step, setStep] = useState<'request' | 'verify' | 'complete'>('request');
    const [email, setEmail] = useState('');

    const handleRequestSuccess = (email: string) => {
        setEmail(email);
        setStep('verify');
    };

    const handleVerifySuccess = () => {
        setStep('complete');
    };

    let title = "Create an Account";
    let subtitle = "Start your adventure with us today.";

    if (step === 'verify') {
        title = "Verify Email";
        subtitle = "We've sent a code to your email.";
    } else if (step === 'complete') {
        title = "Finish Up";
        subtitle = "Just a few more details.";
    }

    return (
        <AuthLayout title={title} subtitle={subtitle}>
            {step === 'request' && <RegisterRequestOTPForm onSuccess={handleRequestSuccess} />}
            {step === 'verify' && <RegisterVerifyOTPForm email={email} onSuccess={handleVerifySuccess} />}
            {step === 'complete' && <CompleteRegisterForm email={email} />}
        </AuthLayout>
    );
}