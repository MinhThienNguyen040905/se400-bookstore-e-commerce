// utils/orderScheduler.js
import cron from 'node-cron';
import { Op } from 'sequelize';
import Order from '../models/Order.js';
import { ORDER_STATUS } from '../constants/orderStatus.js';

// Cấu hình thời gian giả lập (giống trong file controller cũ của bạn)
const DAYS_TO_SHIP = 2;      // Sau 2 ngày -> Shipped
const DAYS_TO_DELIVER = 4;   // Sau 4 ngày -> Delivered

const runOrderScheduler = () => {
    // Chạy mỗi giờ. (Dùng '* * * * *' nếu muốn test mỗi phút)
    cron.schedule('0 * * * *', async () => {
        console.log('--- ⏳ Bắt đầu quét đơn hàng tự động... ---');

        try {
            const now = new Date();

            // 1. TỰ ĐỘNG CHUYỂN: PROCESSING -> SHIPPED
            const processingDeadline = new Date(now);
            processingDeadline.setDate(processingDeadline.getDate() - DAYS_TO_SHIP);

            const ordersToShip = await Order.findAll({
                where: {
                    status: ORDER_STATUS.PROCESSING,
                    order_date: { [Op.lte]: processingDeadline }
                }
            });

            if (ordersToShip.length > 0) {
                const ids = ordersToShip.map(o => o.order_id);
                await Order.update(
                    { status: ORDER_STATUS.SHIPPED },
                    { where: { order_id: ids } }
                );
                console.log(`✅ Đã chuyển ${ordersToShip.length} đơn sang trạng thái SHIPPED`);
            }

            // 2. TỰ ĐỘNG CHUYỂN: SHIPPED -> DELIVERED & PAID
            const deliveryDeadline = new Date(now);
            deliveryDeadline.setDate(deliveryDeadline.getDate() - DAYS_TO_DELIVER);

            const ordersToDeliver = await Order.findAll({
                where: {
                    status: ORDER_STATUS.SHIPPED,
                    order_date: { [Op.lte]: deliveryDeadline }
                }
            });

            if (ordersToDeliver.length > 0) {
                const ids = ordersToDeliver.map(o => o.order_id);

                // Cập nhật: Status -> DELIVERED VÀ payment_status -> 'paid'
                await Order.update(
                    {
                        status: ORDER_STATUS.DELIVERED,
                        payment_status: 'paid' // <--- Tự động đánh dấu đã thanh toán (cho COD)
                    },
                    { where: { order_id: ids } }
                );
                console.log(`✅ Đã chuyển ${ordersToDeliver.length} đơn sang trạng thái DELIVERED và PAID`);
            }

        } catch (err) {
            console.error('❌ Lỗi khi chạy Scheduler:', err);
        }
    });

    console.log('✅ Đã kích hoạt Order Scheduler (chạy ngầm)');
};

export default runOrderScheduler;