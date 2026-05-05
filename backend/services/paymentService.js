import { Op } from 'sequelize';
import sequelize from '../config/db.js';
import AppError from '../errors/AppError.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import CartItem from '../models/CartItem.js';
import Book from '../models/Book.js';
import PromoCode from '../models/PromoCode.js';
import { ORDER_STATUS } from '../constants/orderStatus.js';
import { sendOrderConfirmation } from '../utils/email.js';
import vnpayService from './vnpayService.js';

const PENDING_PAYMENT_EXPIRE_MINUTES = 15;

const buildFailureUrl = ({ clientUrl, code, message }) => {
    const url = new URL('/order-failure', clientUrl);
    url.searchParams.set('code', code);
    if (message) url.searchParams.set('message', message);
    return url.toString();
};

const buildSuccessUrl = ({ clientUrl, orderId }) => {
    const url = new URL('/order-success', clientUrl);
    url.searchParams.set('code', '00');
    url.searchParams.set('orderId', orderId);
    return url.toString();
};

const applyPromoCode = async ({ promoCode, totalPrice }) => {
    if (!promoCode) return { totalPrice, promoId: null };

    const promo = await PromoCode.findOne({
        where: {
            code: promoCode.toUpperCase(),
            expiry_date: { [Op.gte]: new Date() }
        }
    });

    if (!promo || totalPrice < promo.min_amount) {
        return { totalPrice, promoId: null };
    }

    return {
        totalPrice: totalPrice - (totalPrice * promo.discount_percent) / 100,
        promoId: promo.promo_id
    };
};

const sendVnpayConfirmation = async ({ order, orderId }) => {
    if (!order.User?.email) return;

    try {
        const items = order.OrderItems.map((item) => ({
            title: item.Book.title,
            quantity: item.quantity,
            price: item.price
        }));

        await sendOrderConfirmation({
            to: order.User.email,
            name: order.User.name,
            orderId,
            totalPrice: order.total_price,
            items
        });
    } catch (err) {
        console.error('Loi gui mail xac nhan VNPay:', err);
    }
};

const createVnpayPayment = async ({ userId, address, phone, promoCode, ipAddress }) => {
    if (!address || !phone) {
        throw new AppError('Vui long cung cap dia chi va SDT', 400);
    }

    const transaction = await sequelize.transaction();

    try {
        const cartItems = await CartItem.findAll({
            where: { user_id: userId },
            include: [Book],
            transaction
        });

        if (!cartItems.length) {
            throw new AppError('Gio hang trong', 400);
        }

        let totalPrice = 0;
        for (const item of cartItems) {
            const book = item.Book;
            if (!book || book.stock < item.quantity) {
                throw new AppError(`Het hang: ${book?.title || item.book_id}`, 400);
            }
            totalPrice += item.quantity * book.price;
        }

        const promoResult = await applyPromoCode({ promoCode, totalPrice });
        totalPrice = promoResult.totalPrice;

        const order = await Order.create({
            user_id: userId,
            promo_id: promoResult.promoId,
            total_price: Math.round(totalPrice),
            payment_method: 'VNPay',
            status: ORDER_STATUS.PENDING_PAYMENT,
            address,
            phone,
            payment_status: 'pending'
        }, { transaction });

        for (const item of cartItems) {
            await OrderItem.create({
                order_id: order.order_id,
                book_id: item.book_id,
                quantity: item.quantity,
                price: item.Book.price
            }, { transaction });

            await Book.decrement('stock', {
                by: item.quantity,
                where: { book_id: item.book_id },
                transaction
            });
        }

        await transaction.commit();

        return {
            paymentUrl: vnpayService.createPaymentUrl({
                orderId: order.order_id,
                amount: Math.round(totalPrice),
                ipAddress
            })
        };
    } catch (err) {
        if (!transaction.finished) await transaction.rollback();
        throw err;
    }
};

const handleVnpayReturn = async ({ query, clientUrl }) => {
    const { isValid, params } = vnpayService.verifyReturnParams(query);
    if (!isValid) {
        return { redirectUrl: buildFailureUrl({ clientUrl, code: '97', message: 'Invalid Signature' }) };
    }

    const orderId = params.vnp_TxnRef;
    const responseCode = params.vnp_ResponseCode;
    const transactionNo = params.vnp_TransactionNo;
    const transaction = await sequelize.transaction();

    try {
        const order = await Order.findByPk(orderId, {
            include: [{ model: OrderItem, include: [Book] }, { model: User }],
            transaction
        });

        if (!order) {
            await transaction.rollback();
            return { redirectUrl: buildFailureUrl({ clientUrl, code: '01', message: 'Order Not Found' }) };
        }

        if (order.payment_status === 'paid' || order.status !== ORDER_STATUS.PENDING_PAYMENT) {
            await transaction.rollback();
            return { redirectUrl: buildSuccessUrl({ clientUrl, orderId }) };
        }

        if (responseCode === '00') {
            order.status = ORDER_STATUS.PROCESSING;
            order.payment_status = 'paid';
            order.vnpay_transaction_no = transactionNo;
            await order.save({ transaction });

            await CartItem.destroy({ where: { user_id: order.user_id }, transaction });
            await transaction.commit();

            await sendVnpayConfirmation({ order, orderId });

            return { redirectUrl: buildSuccessUrl({ clientUrl, orderId }) };
        }

        for (const item of order.OrderItems) {
            await Book.increment('stock', {
                by: item.quantity,
                where: { book_id: item.book_id },
                transaction
            });
        }

        await order.destroy({ transaction });
        await transaction.commit();

        return { redirectUrl: buildFailureUrl({ clientUrl, code: responseCode }) };
    } catch (err) {
        if (!transaction.finished) await transaction.rollback();
        console.error(err);
        return { redirectUrl: buildFailureUrl({ clientUrl, code: '99' }) };
    }
};

const cleanupExpiredPendingPayments = async () => {
    const deadline = new Date(Date.now() - PENDING_PAYMENT_EXPIRE_MINUTES * 60 * 1000);
    const transaction = await sequelize.transaction();

    try {
        const expiredOrders = await Order.findAll({
            where: {
                status: ORDER_STATUS.PENDING_PAYMENT,
                payment_status: 'pending',
                order_date: { [Op.lte]: deadline }
            },
            include: [{ model: OrderItem }],
            transaction
        });

        for (const order of expiredOrders) {
            for (const item of order.OrderItems) {
                await Book.increment('stock', {
                    by: item.quantity,
                    where: { book_id: item.book_id },
                    transaction
                });
            }

            await order.destroy({ transaction });
        }

        await transaction.commit();
        return expiredOrders.length;
    } catch (err) {
        if (!transaction.finished) await transaction.rollback();
        throw err;
    }
};

export default { createVnpayPayment, handleVnpayReturn, cleanupExpiredPendingPayments };
