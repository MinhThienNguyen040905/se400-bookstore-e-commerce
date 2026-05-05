import 'dotenv/config';
import multer from 'multer';
import os from 'os';
import authService from '../services/authService.js';
import otpService from '../services/otpService.js';
import userService from '../services/userService.js';
import { refreshCookieOptions } from '../utils/cookieOptions.js';

const upload = multer({ dest: os.tmpdir() });
const uploadAvatar = upload.single('avatar');

const login = async (req, res) => {
    const result = await authService.login({
        email: req.body.email,
        password: req.body.password
    });

    res.cookie('refreshToken', result.refreshToken, {
        ...refreshCookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.success({
        accessToken: result.accessToken,
        user: result.user
    }, 'Dang nhap thanh cong');
};

const getUsers = async (req, res) => {
    const users = await userService.getUsers();
    res.success(users, 'Lay danh sach nguoi dung thanh cong');
};

const signOut = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    await authService.logout({ refreshToken });

    if (refreshToken) {
        res.clearCookie('refreshToken', { ...refreshCookieOptions });
    }

    res.success(null, 'Dang xuat thanh cong', 200);
};

const refreshToken = async (req, res) => {
    const result = await authService.refreshAccessToken({
        refreshToken: req.cookies?.refreshToken
    });

    res.success(result);
};

const requestOTP = async (req, res) => {
    await otpService.requestOTP({ email: req.body.email });
    res.success(null, 'Da gui OTP den email');
};

const verifyOTP = async (req, res) => {
    const result = await otpService.verifyOTP({
        email: req.body.email,
        otp: req.body.otp
    });

    res.success(result, 'Xac thuc OTP thanh cong');
};

const completeRegister = async (req, res) => {
    const result = await userService.completeRegister(req.body);
    res.success(result, 'Dang ky thanh cong');
};

const resetPassword = async (req, res) => {
    await userService.resetPassword(req.body);
    res.success(null, 'Doi mat khau thanh cong');
};

const updateProfile = async (req, res) => {
    const result = await userService.updateProfile({
        userId: req.user.user_id,
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address,
        avatarFile: req.file
    });

    res.success(result, 'Cap nhat thong tin thanh cong');
};

const changePassword = async (req, res) => {
    await userService.changePassword({
        userId: req.user.user_id,
        oldPassword: req.body.oldPassword,
        newPassword: req.body.newPassword
    });

    res.success(null, 'Doi mat khau thanh cong');
};

const deleteUser = async (req, res) => {
    const result = await userService.deleteUser({
        requesterId: req.user.user_id,
        requesterRole: req.user.role,
        targetUserId: req.body.id
    });

    res.success(result, 'Xoa nguoi dung thanh cong');
};

export default {
    login,
    getUsers,
    signOut,
    refreshToken,
    requestOTP,
    verifyOTP,
    completeRegister,
    resetPassword,
    uploadAvatar,
    updateProfile,
    changePassword,
    deleteUser
};
