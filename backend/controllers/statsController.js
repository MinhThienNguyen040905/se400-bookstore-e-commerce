// controllers/statsController.js
import User from '../models/User.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Book from '../models/Book.js';
import { Op } from 'sequelize';
import sequelize from '../config/db.js'; // <--- BỔ SUNG IMPORT NÀY

const getStats = async (req, res) => {
    try {
        // Validation: Đảm bảo user là admin
        if (!req.user || req.user.role !== 'admin') {
            return res.error('Chỉ admin mới có quyền xem thống kê', 403);
        }

        // --- 1. SỐ LIỆU TỔNG QUAN (Code cũ) ---
        const totalUsers = await User.count({
            where: { role: 'customer' }
        });

        const totalOrders = await Order.count();

        // Chỉ tính doanh thu đơn đã giao/đang giao
        const revenueResult = await Order.sum('total_price', {
            where: {
                status: {
                    [Op.in]: ['delivered', 'shipped']
                }
            }
        });
        const totalRevenue = revenueResult || 0;

        // --- 2. ĐƠN HÀNG GẦN ĐÂY (Code cũ) ---
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

        // --- 3. BIỂU ĐỒ DOANH THU THEO THÁNG (Mới bổ sung) ---
        const currentYear = new Date().getFullYear();

        // Query database: Nhóm theo tháng và tính tổng
        const monthlyData = await Order.findAll({
            attributes: [
                [sequelize.fn('MONTH', sequelize.col('order_date')), 'month'],
                [sequelize.fn('SUM', sequelize.col('total_price')), 'revenue']
            ],
            where: {
                status: { [Op.in]: ['delivered', 'shipped'] }, // Chỉ tính đơn thành công
                // Lọc theo năm hiện tại
                [Op.and]: [
                    sequelize.where(sequelize.fn('YEAR', sequelize.col('order_date')), currentYear)
                ]
            },
            group: [sequelize.fn('MONTH', sequelize.col('order_date'))],
            raw: true
        });

        // Tạo mảng mẫu đủ 12 tháng (Mặc định revenue = 0)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyRevenue = monthNames.map(name => ({ name, revenue: 0 }));

        // Map dữ liệu từ DB vào mảng mẫu
        // SQL trả về month từ 1-12, mảng JS index từ 0-11 -> cần trừ đi 1
        monthlyData.forEach(item => {
            const monthIndex = item.month - 1;
            if (monthIndex >= 0 && monthIndex < 12) {
                monthlyRevenue[monthIndex].revenue = parseFloat(item.revenue); // Ép kiểu về số
            }
        });

        // --- 4. TRẢ VỀ RESPONSE ---
        res.success({
            totalUsers,
            totalOrders,
            totalRevenue: parseFloat(totalRevenue),
            recentOrders,
            monthlyRevenue // <--- Trường mới cho biểu đồ
        }, 'Lấy thống kê thành công');

    } catch (err) {
        console.error('Error in getStats:', err);
        res.error('Lỗi server khi lấy thống kê', 500);
    }
};

export default { getStats };