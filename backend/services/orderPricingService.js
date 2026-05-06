import { Op } from 'sequelize';
import PromoCode from '../models/PromoCode.js';

const getCartItemBook = (item) => item.Book || item.book;

const calculateCartSubtotal = (cartItems) => cartItems.reduce((subtotal, item) => {
    const book = getCartItemBook(item);
    return subtotal + item.quantity * book.price;
}, 0);

const applyPromoCode = async ({ promoCode, subtotal }) => {
    if (!promoCode) {
        return {
            subtotal,
            discountAmount: 0,
            totalPrice: subtotal,
            promoId: null,
            promo: null
        };
    }

    const promo = await PromoCode.findOne({
        where: {
            code: promoCode.toUpperCase(),
            expiry_date: { [Op.gte]: new Date() }
        }
    });

    if (!promo || subtotal < promo.min_amount) {
        return {
            subtotal,
            discountAmount: 0,
            totalPrice: subtotal,
            promoId: null,
            promo: null
        };
    }

    const discountAmount = (subtotal * promo.discount_percent) / 100;

    return {
        subtotal,
        discountAmount,
        totalPrice: subtotal - discountAmount,
        promoId: promo.promo_id,
        promo
    };
};

const calculateOrderPricing = async ({ cartItems, promoCode }) => {
    const subtotal = calculateCartSubtotal(cartItems);
    return applyPromoCode({ promoCode, subtotal });
};

export {
    calculateCartSubtotal,
    applyPromoCode,
    calculateOrderPricing
};
