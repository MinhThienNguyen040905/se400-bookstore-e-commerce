// controllers/userController.js
import User from '../models/User.js';
import OtpTemp from '../models/OtpTemp.js';
import { sendOTP, } from '../utils/email.js';
import Session from '../models/Session.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Crypto from 'crypto';
import 'dotenv/config';
import { Op } from 'sequelize';
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from '../constants/auth.js';
import { log } from 'console';
// 1. THÊM CÁC IMPORT NÀY (để xử lý file và upload)
import cloudinary from '../cloudinary.js';
import multer from 'multer';
import fs from 'fs';

// 2. CẤU HÌNH MULTER (Lưu file tạm vào thư mục 'uploads/')
// const upload = multer({ dest: 'uploads/' });
import os from 'os';
const upload = multer({ dest: os.tmpdir() });
const uploadAvatar = upload.single('avatar'); // 'avatar' là tên key mà frontend gửi lên


// === LOGIN ===
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user || !(await user.validPassword(password))) {
            return res.error('Email hoặc mật khẩu không đúng', 401);
        }

        const accessToken = jwt.sign(
            { user_id: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: Math.floor(ACCESS_TOKEN_TTL / 1000) }
        );

        const refreshToken = Crypto.randomBytes(64).toString('hex');

        await Session.create({
            user_id: user.user_id,
            refresh_token: refreshToken,
            expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL)
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: REFRESH_TOKEN_TTL
        });

        res.success({
            accessToken,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                avatar: user.avatar
            }
        }, 'Đăng nhập thành công');
    } catch (err) {
        console.error('Login error:', err);
        res.error('Lỗi server', 500);
    }
};

// === GET ALL USERS (ADMIN ONLY) ===
const getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['user_id', 'name', 'email', 'role', 'phone', 'address', 'avatar']
        });
        res.success(users, 'Lấy danh sách người dùng thành công');
    } catch (err) {
        res.error('Lỗi server', 500);
    }
};

// === LOGOUT ===
const signOut = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            await Session.destroy({ where: { refresh_token: refreshToken } });
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            });
        }
        res.success(null, 'Đăng xuất thành công', 200);
    } catch (err) {
        res.error('Lỗi hệ thống', 500);
    }
};

// === REFRESH TOKEN ===
const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) return res.error('Không tìm thấy refresh token', 401);

        const session = await Session.findOne({
            where: {
                refresh_token: refreshToken,
                expires_at: { [Op.gt]: new Date() }
            }
        });

        if (!session) return res.error('Refresh token không hợp lệ hoặc đã hết hạn', 403);

        const user = await User.findByPk(session.user_id);
        if (!user) return res.error('Người dùng không tồn tại', 404);

        const accessToken = jwt.sign(
            { user_id: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: Math.floor(ACCESS_TOKEN_TTL / 1000) }
        );

        res.success({ accessToken, expiresIn: ACCESS_TOKEN_TTL / 1000 });
    } catch (err) {
        res.error('Lỗi hệ thống', 500);
    }
};

// === YÊU CẦU OTP ===
const requestOTP = async (req, res) => {
    const { email } = req.body;
    console.log('Email nhận từ client:', email);

    // REGEX CHUẨN EMAIL (cho phép _, -, ., chữ số)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
        return res.error('Email không hợp lệ', 400);
    }

    try {
        const otp = Crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 6);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await OtpTemp.upsert({ email, otp, expiresAt });
        await sendOTP(email, otp);

        res.success(null, 'Đã gửi OTP đến email');
    } catch (err) {
        console.error('Error sending OTP:', err);
        res.error('Lỗi gửi OTP', 500);
    }
};

// === XÁC THỰC OTP ===
const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const record = await OtpTemp.findOne({ where: { email, otp } });
        if (!record || record.expiresAt < new Date()) {
            return res.error('OTP không hợp lệ hoặc đã hết hạn', 400);
        }

        res.success({ verified: true }, 'Xác thực OTP thành công');
    } catch (err) {
        res.error('Lỗi server', 500);
    }
};

// === HOÀN TẤT ĐĂNG KÝ ===
const completeRegister = async (req, res) => {
    const { email, password, name, phone, address } = req.body;
    try {
        const otpRecord = await OtpTemp.findOne({ where: { email } });
        if (!otpRecord || otpRecord.expiresAt < new Date()) {
            return res.error('OTP hết hạn, vui lòng yêu cầu lại', 400);
        }

        const user = await User.create({ email, password, name, phone, address, role: 'customer' });
        await otpRecord.destroy(); // Xóa OTP


        res.success({ user }, 'Đăng ký thành công');
    } catch (err) {
        res.error(err.message || 'Email đã tồn tại', 400);
    }
};


// === QUÊN MẬT KHẨU → ĐỔI MK ===
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const otpRecord = await OtpTemp.findOne({ where: { email, otp } });
        if (!otpRecord || otpRecord.expiresAt < new Date()) {
            return res.error('OTP không hợp lệ hoặc đã hết hạn', 400);
        }

        const user = await User.findOne({ where: { email } });
        if (!user) return res.error('Email không tồn tại', 404);

        // TỰ HASH TRƯỚC KHI SAVE
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        await otpRecord.destroy();

        res.success(null, 'Đổi mật khẩu thành công');
    } catch (err) {
        console.error('Error resetting password:', err);
        res.error('Lỗi server', 500);
    }
};

const updateProfile = async (req, res) => {
    const userId = req.user.user_id;
    // Lấy các thông tin text từ req.body
    const { name, phone, address } = req.body;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.error('Người dùng không tồn tại', 404);
        }

        // --- XỬ LÝ ẢNH (NẾU CÓ GỬI LÊN) ---
        if (req.file) {
            // Upload ảnh lên Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path);

            // Xóa ảnh cũ trên Cloudinary (Optional - để tiết kiệm dung lượng)
            if (user.avatar) {
                try {
                    const urlParts = user.avatar.split('/');
                    const publicId = urlParts[urlParts.length - 1].split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                } catch (err) {
                    console.log('Không xóa được ảnh cũ:', err.message);
                }
            }

            // Cập nhật URL mới vào object user
            user.avatar = result.secure_url;

            // Xóa file tạm trên server
            fs.unlinkSync(req.file.path);
        }

        // --- CẬP NHẬT THÔNG TIN TEXT ---
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address) user.address = address;

        await user.save();

        res.success({
            user_id: user.user_id,
            name: user.name,
            phone: user.phone,
            address: user.address,
            avatar: user.avatar,
            role: user.role
        }, 'Cập nhật thông tin thành công');

    } catch (err) {
        // Nếu lỗi, nhớ xóa file tạm nếu nó đã được tạo ra
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error('Update profile error:', err);
        res.error('Lỗi server khi cập nhật thông tin', 500);
    }
};

// === ĐỔI MẬT KHẨU ===
const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.user_id;

    try {
        // 1. Validate dữ liệu đầu vào
        if (!oldPassword || !newPassword) {
            return res.error('Vui lòng nhập mật khẩu cũ và mật khẩu mới', 400);
        }

        if (newPassword.length < 6) {
            return res.error('Mật khẩu mới phải có ít nhất 6 ký tự', 400);
        }

        // 2. Tìm user trong DB
        const user = await User.findByPk(userId);
        if (!user) {
            return res.error('Người dùng không tồn tại', 404);
        }

        // 3. Kiểm tra mật khẩu cũ có đúng không
        const isMatch = await user.validPassword(oldPassword); // Hàm này đã có sẵn trong User model
        if (!isMatch) {
            return res.error('Mật khẩu cũ không chính xác', 400);
        }

        // 4. Mã hóa mật khẩu mới và lưu lại
        // Lưu ý: User model chỉ có hook beforeCreate, không có beforeUpdate nên phải hash thủ công ở đây
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        await user.save();

        res.success(null, 'Đổi mật khẩu thành công');

    } catch (err) {
        console.error('Change password error:', err);
        res.error('Lỗi server khi đổi mật khẩu', 500);
    }
};

// === XÓA NGƯỜI DÙNG (Dùng Body) ===
const deleteUser = async (req, res) => {
    // 1. LẤY ID TỪ BODY
    const { id } = req.body;
    const requesterId = req.user.user_id; // ID người đang gọi API
    const requesterRole = req.user.role;

    try {
        // Validation: Kiểm tra xem có gửi ID lên không
        if (!id) {
            return res.error('Vui lòng cung cấp ID người dùng cần xóa', 400);
        }

        if (isNaN(id)) {
            return res.error('ID người dùng không hợp lệ', 400);
        }

        const targetUserId = parseInt(id);

        // 2. KIỂM TRA QUYỀN HẠN
        // Chỉ Admin hoặc Chính chủ mới được xóa
        if (requesterRole !== 'admin' && requesterId !== targetUserId) {
            return res.error('Bạn không có quyền xóa tài khoản này', 403);
        }

        // 3. Tìm user trong DB
        const user = await User.findByPk(targetUserId);
        if (!user) {
            return res.error('Người dùng không tồn tại', 404);
        }

        // 4. Xóa Avatar trên Cloudinary (nếu có)
        if (user.avatar) {
            try {
                const urlParts = user.avatar.split('/');
                const publicId = urlParts[urlParts.length - 1].split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (err) {
                console.log('Lỗi xóa ảnh Cloudinary:', err.message);
            }
        }

        // 5. Xóa trong DB
        await user.destroy();

        res.success({ deleted_id: targetUserId }, 'Xóa người dùng thành công');

    } catch (err) {
        console.error('Delete user error:', err);
        res.error('Lỗi server khi xóa người dùng', 500);
    }
};

export default {
    login, getUsers, signOut, refreshToken, requestOTP, verifyOTP, completeRegister, resetPassword, uploadAvatar, updateProfile, changePassword,
    deleteUser
};