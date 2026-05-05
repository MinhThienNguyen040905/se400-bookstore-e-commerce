import Crypto from 'crypto';
import AppError from '../errors/AppError.js';
import OtpTemp from '../models/OtpTemp.js';
import { sendOTP } from '../utils/email.js';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const assertValidEmail = (email) => {
    if (!email || !emailRegex.test(email)) {
        throw new AppError('Email khong hop le', 400);
    }
};

const requestOTP = async ({ email }) => {
    assertValidEmail(email);

    const otp = Crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 6);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OtpTemp.upsert({ email, otp, expiresAt });
    await sendOTP(email, otp);
};

const verifyOTP = async ({ email, otp }) => {
    const record = await OtpTemp.findOne({ where: { email, otp } });
    if (!record || record.expiresAt < new Date()) {
        throw new AppError('OTP khong hop le hoac da het han', 400);
    }

    return { verified: true };
};

export default { requestOTP, verifyOTP };
