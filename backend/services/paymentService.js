import { Op } from 'sequelize';
import AppError from '../errors/AppError.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import CartItem from '../models/CartItem.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import { ORDER_STATUS } from '../constants/orderStatus.js';
import { sendOrderConfirmation } from '../utils/email.js';
import withTransaction from '../utils/withTransaction.js';
import { calculateOrderPricing } from './orderPricingService.js';
import {
    decreaseStockForCartItems,
    restoreStockForOrderItems,
    validateCartItemsInStock
} from './inventoryService.js';
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

const releasePendingPaymentOrder = async ({ order, transaction, reason }) => {
    if (order.status !== ORDER_STATUS.PENDING_PAYMENT || order.payment_status !== 'pending') {
        return false;
    }

    await restoreStockForOrderItems({ orderItems: order.OrderItems || [], transaction });

    order.status = ORDER_STATUS.CANCELLED;
    order.payment_status = 'failed';
    await order.save({ transaction });

    if (reason) {
        console.log(`Released pending VNPay order ${order.order_id}: ${reason}`);
    }

    return true;
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

    return withTransaction(async (transaction) => {
        const cartItems = await CartItem.findAll({
            where: { user_id: userId },
            include: [Book],
            transaction
        });

        if (!cartItems.length) {
            throw new AppError('Gio hang trong', 400);
        }

        const existingPendingOrders = await Order.findAll({
            where: {
                user_id: userId,
                payment_method: 'VNPay',
                status: ORDER_STATUS.PENDING_PAYMENT,
                payment_status: 'pending'
            },
            include: [{ model: OrderItem }],
            lock: transaction.LOCK.UPDATE,
            transaction
        });

        for (const pendingOrder of existingPendingOrders) {
            await releasePendingPaymentOrder({
                order: pendingOrder,
                transaction,
                reason: 'creating replacement VNPay payment'
            });
        }

        const booksById = await validateCartItemsInStock({ cartItems, transaction, lock: true });

        const pricingItems = cartItems.map((item) => ({
            quantity: item.quantity,
            Book: booksById.get(item.book_id)
        }));
        const pricing = await calculateOrderPricing({ cartItems: pricingItems, promoCode });

        const order = await Order.create({
            user_id: userId,
            promo_id: pricing.promoId,
            total_price: Math.round(pricing.totalPrice),
            payment_method: 'VNPay',
            status: ORDER_STATUS.PENDING_PAYMENT,
            address,
            phone,
            payment_status: 'pending'
        }, { transaction });

        for (const item of cartItems) {
            const book = booksById.get(item.book_id);

            await OrderItem.create({
                order_id: order.order_id,
                book_id: item.book_id,
                quantity: item.quantity,
                price: book.price
            }, { transaction });
        }

        await decreaseStockForCartItems({ cartItems, transaction });

        return {
            paymentUrl: vnpayService.createPaymentUrl({
                orderId: order.order_id,
                amount: Math.round(pricing.totalPrice),
                ipAddress
            })
        };
    });
};

const handleVnpayReturn = async ({ query, clientUrl }) => {
    const { isValid, params } = vnpayService.verifyReturnParams(query);
    if (!isValid) {
        return { redirectUrl: buildFailureUrl({ clientUrl, code: '97', message: 'Invalid Signature' }) };
    }

    const orderId = params.vnp_TxnRef;
    const responseCode = params.vnp_ResponseCode;
    const transactionNo = params.vnp_TransactionNo;
    try {
        const result = await withTransaction(async (transaction) => {
            const order = await Order.findByPk(orderId, {
                include: [{ model: OrderItem, include: [Book] }, { model: User }],
                transaction
            });

            if (!order) {
                return { redirectUrl: buildFailureUrl({ clientUrl, code: '01', message: 'Order Not Found' }) };
            }

            if (order.payment_status === 'paid') {
                return { redirectUrl: buildSuccessUrl({ clientUrl, orderId }) };
            }

            if (order.status === ORDER_STATUS.CANCELLED || order.payment_status === 'failed') {
                return {
                    redirectUrl: buildFailureUrl({
                        clientUrl,
                        code: responseCode || '24',
                        message: 'Payment Failed Or Cancelled'
                    })
                };
            }

            if (order.status !== ORDER_STATUS.PENDING_PAYMENT || order.payment_status !== 'pending') {
                return {
                    redirectUrl: buildFailureUrl({
                        clientUrl,
                        code: '98',
                        message: 'Invalid Order Payment State'
                    })
                };
            }

            if (responseCode === '00') {
                order.status = ORDER_STATUS.PROCESSING;
                order.payment_status = 'paid';
                order.vnpay_transaction_no = transactionNo;
                await order.save({ transaction });

                await CartItem.destroy({ where: { user_id: order.user_id }, transaction });

                return {
                    redirectUrl: buildSuccessUrl({ clientUrl, orderId }),
                    confirmedOrder: order
                };
            }

            await restoreStockForOrderItems({ orderItems: order.OrderItems, transaction });

            order.status = ORDER_STATUS.CANCELLED;
            order.payment_status = 'failed';
            order.vnpay_transaction_no = transactionNo || order.vnpay_transaction_no;
            await order.save({ transaction });

            return { redirectUrl: buildFailureUrl({ clientUrl, code: responseCode }) };
        });

        if (result.confirmedOrder) {
            await sendVnpayConfirmation({ order: result.confirmedOrder, orderId });
        }

        return { redirectUrl: result.redirectUrl };
    } catch (err) {
        console.error(err);
        return { redirectUrl: buildFailureUrl({ clientUrl, code: '99' }) };
    }
};

const cleanupExpiredPendingPayments = async () => {
    const deadline = new Date(Date.now() - PENDING_PAYMENT_EXPIRE_MINUTES * 60 * 1000);

    return withTransaction(async (transaction) => {
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
            await restoreStockForOrderItems({ orderItems: order.OrderItems, transaction });

            order.status = ORDER_STATUS.CANCELLED;
            order.payment_status = 'failed';
            await order.save({ transaction });
        }

        return expiredOrders.length;
    });
};

export default { createVnpayPayment, handleVnpayReturn, cleanupExpiredPendingPayments };
