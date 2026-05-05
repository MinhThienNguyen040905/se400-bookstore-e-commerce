import jwt from 'jsonwebtoken';
import 'dotenv/config';
import User from '../models/User.js'; // adjust path if your model file is named/placed differently

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

        console.log("--- DEBUG OPTIONAL AUTH ---");
        console.log("1. Auth Header:", authHeader);

        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            console.log("2. Không tìm thấy token -> Guest");
            return next();
        }

        console.log("2. Token tìm thấy:", token);
        console.log("3. Secret dùng để verify:", process.env.JWT_SECRET); // Kiểm tra xem biến này có bị undefined không?

        // Verify Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("4. Decoded:", decoded);

        const user = await User.findByPk(decoded.user_id);
        if (user) {
            console.log("5. User found in DB:", user.email);
            req.user = decoded;
        } else {
            console.log("5. User ID trong token không tồn tại trong DB");
        }

        next();
    } catch (err) {
        console.log("❌ LỖI AUTH:", err.message);
        req.user = null;
        next();
    }
};