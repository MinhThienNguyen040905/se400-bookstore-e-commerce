import { Op } from 'sequelize';
import AppError from '../errors/AppError.js';
import PromoCode from '../models/PromoCode.js';

const addPromo = async ({ code, discount_percent, min_amount, expiry_date }) => {
    try {
        return await PromoCode.create({
            code: code.toUpperCase(),
            discount_percent,
            min_amount: min_amount || 0,
            expiry_date
        });
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            throw new AppError('Ma khuyen mai da ton tai', 400);
        }
        throw err;
    }
};

const getPromos = async () => PromoCode.findAll({
    where: {
        expiry_date: { [Op.gte]: new Date() }
    },
    attributes: ['code', 'discount_percent', 'min_amount', 'expiry_date'],
    order: [['createdAt', 'DESC']]
});

const getAllPromos = async ({ page, limit }) => {
    const currentPage = Math.max(parseInt(page) || 1, 1);
    const pageSize = Math.max(parseInt(limit) || 20, 1);
    const offset = (currentPage - 1) * pageSize;

    const { count, rows } = await PromoCode.findAndCountAll({
        limit: pageSize,
        offset,
        order: [['createdAt', 'DESC']]
    });

    return {
        promos: rows,
        pagination: {
            totalItems: count,
            totalPages: Math.ceil(count / pageSize),
            currentPage,
            pageSize
        }
    };
};

const getPromoByCode = async ({ code, total_price }) => {
    if (!code) throw new AppError('Vui long nhap ma khuyen mai', 400);
    if (!total_price || total_price < 0) throw new AppError('Tong tien khong hop le', 400);

    const promo = await PromoCode.findOne({
        where: {
            code: code.toUpperCase(),
            expiry_date: { [Op.gte]: new Date() }
        }
    });

    if (!promo) {
        throw new AppError('Ma khuyen mai khong ton tai hoac da het han', 404);
    }

    if (total_price < promo.min_amount) {
        throw new AppError(`Don hang phai tu ${promo.min_amount.toLocaleString()}d de dung ma nay`, 400);
    }

    const discountAmount = total_price * (promo.discount_percent / 100);
    const finalPrice = total_price - discountAmount;

    return {
        code: promo.code,
        discount_percent: promo.discount_percent,
        discount_amount: Math.round(discountAmount),
        min_amount: promo.min_amount,
        expiry_date: promo.expiry_date,
        final_price: Math.round(finalPrice),
        message: `Ap dung ma thanh cong! Tiet kiem ${Math.round(discountAmount).toLocaleString()}d`
    };
};

export default {
    addPromo,
    getPromos,
    getAllPromos,
    getPromoByCode
};
