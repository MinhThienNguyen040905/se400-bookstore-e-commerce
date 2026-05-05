import jwt from 'jsonwebtoken';
import Crypto from 'crypto';
import { Op } from 'sequelize';
import AppError from '../errors/AppError.js';
import User from '../models/User.js';
import Session from '../models/Session.js';
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from '../constants/auth.js';

const signAccessToken = (user) => jwt.sign(
    { user_id: user.user_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: Math.floor(ACCESS_TOKEN_TTL / 1000) }
);

const toAuthUser = (user) => ({
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    avatar: user.avatar
});

const login = async ({ email, password }) => {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.validPassword(password))) {
        throw new AppError('Email hoac mat khau khong dung', 401);
    }

    const accessToken = signAccessToken(user);
    const refreshToken = Crypto.randomBytes(64).toString('hex');

    await Session.create({
        user_id: user.user_id,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL)
    });

    return {
        accessToken,
        refreshToken,
        user: toAuthUser(user)
    };
};

const logout = async ({ refreshToken }) => {
    if (!refreshToken) return;

    await Session.destroy({ where: { refresh_token: refreshToken } });
};

const refreshAccessToken = async ({ refreshToken }) => {
    if (!refreshToken) {
        throw new AppError('Khong tim thay refresh token', 401);
    }

    const session = await Session.findOne({
        where: {
            refresh_token: refreshToken,
            expires_at: { [Op.gt]: new Date() }
        }
    });

    if (!session) {
        throw new AppError('Refresh token khong hop le hoac da het han', 403);
    }

    const user = await User.findByPk(session.user_id);
    if (!user) {
        throw new AppError('Nguoi dung khong ton tai', 404);
    }

    return {
        accessToken: signAccessToken(user),
        expiresIn: ACCESS_TOKEN_TTL / 1000
    };
};

export default { login, logout, refreshAccessToken };
