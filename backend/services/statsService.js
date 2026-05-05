import User from '../models/User.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Book from '../models/Book.js';
import { Op } from 'sequelize';
import sequelize from '../config/db.js';

const getStats = async () => {
    const totalUsers = await User.count({
        where: { role: 'customer' }
    });

    const totalOrders = await Order.count();

    const revenueResult = await Order.sum('total_price', {
        where: {
            status: {
                [Op.in]: ['delivered', 'shipped']
            }
        }
    });

    const recentOrders = await Order.findAll({
        limit: 5,
        order: [['order_date', 'DESC']],
        include: [
            {
                model: User,
                attributes: ['user_id', 'name', 'email']
            },
            {
                model: OrderItem,
                include: [{ model: Book, attributes: ['title', 'cover_image'] }]
            }
        ]
    });

    const currentYear = new Date().getFullYear();

    const monthlyData = await Order.findAll({
        attributes: [
            [sequelize.fn('MONTH', sequelize.col('order_date')), 'month'],
            [sequelize.fn('SUM', sequelize.col('total_price')), 'revenue']
        ],
        where: {
            status: { [Op.in]: ['delivered', 'shipped'] },
            [Op.and]: [
                sequelize.where(sequelize.fn('YEAR', sequelize.col('order_date')), currentYear)
            ]
        },
        group: [sequelize.fn('MONTH', sequelize.col('order_date'))],
        raw: true
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = monthNames.map((name) => ({ name, revenue: 0 }));

    monthlyData.forEach((item) => {
        const monthIndex = item.month - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
            monthlyRevenue[monthIndex].revenue = parseFloat(item.revenue);
        }
    });

    return {
        totalUsers,
        totalOrders,
        totalRevenue: parseFloat(revenueResult || 0),
        recentOrders,
        monthlyRevenue
    };
};

export default { getStats };
