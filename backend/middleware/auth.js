import jwt from 'jsonwebtoken';
import 'dotenv/config';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
    const authHeader = req.header('Authorization') || req.header('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.user_id);
        if (!user) return res.status(401).json({ msg: 'User not found' });
        req.user = decoded;

        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

export const adminAuth = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin access required' });
    next();
};

export const optionalAuth = async (req, res, next) => {
    try {
        req.user = null;
        const authHeader = req.header('Authorization') || req.header('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) return next();

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.user_id);
        if (user) req.user = decoded;

        next();
    } catch (err) {
        req.user = null;
        next();
    }
};
