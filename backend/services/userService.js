import bcrypt from 'bcryptjs';
import fs from 'fs';
import AppError from '../errors/AppError.js';
import User from '../models/User.js';
import OtpTemp from '../models/OtpTemp.js';
import cloudinary from '../cloudinary.js';

const destroyCloudinaryImage = async (imageUrl) => {
    if (!imageUrl) return;

    const urlParts = imageUrl.split('/');
    const publicId = urlParts[urlParts.length - 1].split('.')[0];
    await cloudinary.uploader.destroy(publicId);
};

const cleanupTempFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

const getUsers = async () => User.findAll({
    attributes: ['user_id', 'name', 'email', 'role', 'phone', 'address', 'avatar']
});

const completeRegister = async ({ email, password, name, phone, address }) => {
    const otpRecord = await OtpTemp.findOne({ where: { email } });
    if (!otpRecord || otpRecord.expiresAt < new Date()) {
        throw new AppError('OTP het han, vui long yeu cau lai', 400);
    }

    try {
        const user = await User.create({ email, password, name, phone, address, role: 'customer' });
        await otpRecord.destroy();

        return { user };
    } catch (err) {
        throw new AppError(err.message || 'Email da ton tai', 400);
    }
};

const resetPassword = async ({ email, otp, newPassword }) => {
    const otpRecord = await OtpTemp.findOne({ where: { email, otp } });
    if (!otpRecord || otpRecord.expiresAt < new Date()) {
        throw new AppError('OTP khong hop le hoac da het han', 400);
    }

    const user = await User.findOne({ where: { email } });
    if (!user) throw new AppError('Email khong ton tai', 404);

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    await otpRecord.destroy();
};

const updateProfile = async ({ userId, name, phone, address, avatarFile }) => {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError('Nguoi dung khong ton tai', 404);

    try {
        if (avatarFile) {
            const result = await cloudinary.uploader.upload(avatarFile.path);

            try {
                await destroyCloudinaryImage(user.avatar);
            } catch (err) {
                console.log('Khong xoa duoc anh cu:', err.message);
            }

            user.avatar = result.secure_url;
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address) user.address = address;

        await user.save();

        return {
            user_id: user.user_id,
            name: user.name,
            phone: user.phone,
            address: user.address,
            avatar: user.avatar,
            role: user.role
        };
    } finally {
        cleanupTempFile(avatarFile?.path);
    }
};

const changePassword = async ({ userId, oldPassword, newPassword }) => {
    if (!oldPassword || !newPassword) {
        throw new AppError('Vui long nhap mat khau cu va mat khau moi', 400);
    }

    if (newPassword.length < 6) {
        throw new AppError('Mat khau moi phai co it nhat 6 ky tu', 400);
    }

    const user = await User.findByPk(userId);
    if (!user) throw new AppError('Nguoi dung khong ton tai', 404);

    const isMatch = await user.validPassword(oldPassword);
    if (!isMatch) {
        throw new AppError('Mat khau cu khong chinh xac', 400);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
};

const deleteUser = async ({ requesterId, requesterRole, targetUserId }) => {
    if (!targetUserId) {
        throw new AppError('Vui long cung cap ID nguoi dung can xoa', 400);
    }

    if (Number.isNaN(Number(targetUserId))) {
        throw new AppError('ID nguoi dung khong hop le', 400);
    }

    const parsedTargetUserId = parseInt(targetUserId);

    if (requesterRole !== 'admin' && requesterId !== parsedTargetUserId) {
        throw new AppError('Ban khong co quyen xoa tai khoan nay', 403);
    }

    const user = await User.findByPk(parsedTargetUserId);
    if (!user) throw new AppError('Nguoi dung khong ton tai', 404);

    if (user.avatar) {
        try {
            await destroyCloudinaryImage(user.avatar);
        } catch (err) {
            console.log('Loi xoa anh Cloudinary:', err.message);
        }
    }

    await user.destroy();

    return { deleted_id: parsedTargetUserId };
};

export default {
    getUsers,
    completeRegister,
    resetPassword,
    updateProfile,
    changePassword,
    deleteUser
};
