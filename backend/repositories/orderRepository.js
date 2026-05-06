import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Book from '../models/Book.js';
import PromoCode from '../models/PromoCode.js';
import User from '../models/User.js';

const findOrderForConfirmationEmail = (orderId) => Order.findByPk(orderId, {
    include: [{ model: OrderItem, include: [Book] }]
});

const findUserOrders = (userId) => Order.findAll({
    where: { user_id: userId },
    include: [
        { model: OrderItem, include: [Book] },
        { model: PromoCode, attributes: ['code', 'discount_percent'] }
    ],
    order: [['order_date', 'DESC']]
});

const findUserOrdersWithTimelineData = (userId) => Order.findAll({
    where: { user_id: userId },
    include: [
        {
            model: OrderItem,
            include: [
                {
                    model: Book,
                    attributes: ['book_id', 'title', 'cover_image']
                }
            ]
        },
        { model: PromoCode, attributes: ['code', 'discount_percent'] }
    ],
    order: [['order_date', 'DESC']]
});

const findAllOrdersPaginated = ({ limit, offset }) => Order.findAndCountAll({
    distinct: true,
    limit,
    offset,
    order: [['order_date', 'DESC']],
    include: [
        {
            model: OrderItem,
            include: [
                {
                    model: Book,
                    attributes: ['book_id', 'title', 'cover_image']
                }
            ]
        },
        {
            model: PromoCode,
            attributes: ['code', 'discount_percent']
        },
        {
            model: User,
            attributes: ['user_id', 'name', 'email']
        }
    ]
});

const findOrderForCancel = ({ orderId, userId, transaction }) => Order.findOne({
    where: {
        order_id: orderId,
        user_id: userId
    },
    include: [{ model: OrderItem }],
    transaction
});

const findOrderDetailById = (orderId) => Order.findByPk(orderId, {
    include: [
        {
            model: OrderItem,
            include: [
                {
                    model: Book,
                    attributes: ['book_id', 'title', 'cover_image', 'price']
                }
            ]
        },
        {
            model: PromoCode,
            attributes: ['code', 'discount_percent', 'min_amount']
        },
        {
            model: User,
            attributes: ['user_id', 'name', 'email', 'phone', 'address']
        }
    ]
});

export default {
    findOrderForConfirmationEmail,
    findUserOrders,
    findUserOrdersWithTimelineData,
    findAllOrdersPaginated,
    findOrderForCancel,
    findOrderDetailById
};
