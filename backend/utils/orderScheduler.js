// utils/orderScheduler.js
import cron from 'node-cron';
import { Op } from 'sequelize';
import Order from '../models/Order.js';
import { ORDER_STATUS } from '../constants/orderStatus.js';

const DAYS_TO_SHIP = 2;
const DAYS_TO_DELIVER = 4;

const runOrderScheduler = () => {
    cron.schedule('0 * * * *', async () => {
        console.log('Start automatic order scan...');

        try {
            const now = new Date();

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
                console.log(`Moved ${ordersToShip.length} orders to SHIPPED`);
            }

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

                await Order.update(
                    { status: ORDER_STATUS.DELIVERED },
                    { where: { order_id: ids } }
                );

                await Order.update(
                    { payment_status: 'paid' },
                    {
                        where: {
                            order_id: ids,
                            payment_method: 'COD'
                        }
                    }
                );

                console.log(`Moved ${ordersToDeliver.length} orders to DELIVERED`);
            }
        } catch (err) {
            console.error('Order scheduler error:', err);
        }
    });

    console.log('Order Scheduler enabled');
};

export default runOrderScheduler;
