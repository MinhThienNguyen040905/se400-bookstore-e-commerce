// controllers/promoController.js
import { Op } from 'sequelize';
import PromoCode from '../models/PromoCode.js';

// === THÊM MÃ KHUYẾN MÃI (ADMIN) ===
const addPromo = async (req, res) => {
    const { code, discount_percent, min_amount, expiry_date } = req.body;

    try {
        const promo = await PromoCode.create({
            code: code.toUpperCase(),
            discount_percent,
            min_amount: min_amount || 0,
            expiry_date
        });

        res.success(promo, 'Thêm mã khuyến mãi thành công', 201);
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.error('Mã khuyến mãi đã tồn tại', 400);
        }
        console.error('Lỗi thêm mã khuyến mãi:', err);
        res.error('Lỗi server', 500);
    }
};

// === LẤY MÃ KHUYẾN MÃI CÒN HIỆU LỰC (CHO KHÁCH) ===
const getPromos = async (req, res) => {
    try {
        const promos = await PromoCode.findAll({
            where: {
                expiry_date: { [Op.gte]: new Date() }
            },
            attributes: ['code', 'discount_percent', 'min_amount', 'expiry_date'],
            order: [['createdAt', 'DESC']]
        });

        res.success(promos, 'Lấy danh sách mã khuyến mãi thành công');
    } catch (err) {
        res.error('Lỗi server', 500);
    }
};

// === LẤY TẤT CẢ MÃ (ADMIN - CÓ PHÂN TRANG) ===
const getAllPromos = async (req, res) => {
    try {
        // 1. Lấy tham số từ Query String
        // Mặc định: trang 1, 20 mã/trang
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 20, 1);
        const offset = (page - 1) * limit;

        // 2. Query DB dùng findAndCountAll
        const { count, rows } = await PromoCode.findAndCountAll({
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']] // Mã mới nhất lên đầu
        });

        // 3. Trả về kết quả kèm Metadata phân trang
        res.success({
            promos: rows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                pageSize: limit
            }
        }, 'Lấy tất cả mã khuyến mãi thành công');

    } catch (err) {
        console.error('Get all promos error:', err);
        res.error('Lỗi server', 500);
    }
};

// === KIỂM TRA MÃ KHUYẾN MÃI HỢP LỆ ===
const getPromoByCode = async (req, res) => {
    const { code, total_price } = req.body;

    if (!code) {
        return res.error('Vui lòng nhập mã khuyến mãi', 400);
    }

    if (!total_price || total_price < 0) {
        return res.error('Tổng tiền không hợp lệ', 400);
    }

    try {
        const promo = await PromoCode.findOne({
            where: {
                code: code.toUpperCase(),
                expiry_date: { [Op.gte]: new Date() }
            }
        });

        if (!promo) {
            return res.error('Mã khuyến mãi không tồn tại hoặc đã hết hạn', 404);
        }

        if (total_price < promo.min_amount) {
            return res.error(
                `Đơn hàng phải từ ${promo.min_amount.toLocaleString()}đ để dùng mã này`,
                400
            );
        }

        // Tính tiền giảm
        const discountAmount = total_price * (promo.discount_percent / 100);
        const finalPrice = total_price - discountAmount;

        const result = {
            code: promo.code,
            discount_percent: promo.discount_percent,
            discount_amount: Math.round(discountAmount),
            min_amount: promo.min_amount,
            expiry_date: promo.expiry_date,
            final_price: Math.round(finalPrice),
            message: `Áp dụng mã thành công! Tiết kiệm ${Math.round(discountAmount).toLocaleString()}đ`
        };

        res.success(result, 'Mã khuyến mãi hợp lệ');
    } catch (err) {
        console.error('Lỗi kiểm tra mã:', err);
        res.error('Lỗi server', 500);
    }
};

export default {
    addPromo,
    getPromos,
    getAllPromos,
    getPromoByCode
};