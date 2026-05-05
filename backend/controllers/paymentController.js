// controllers/paymentController.js
import moment from 'moment';
import qs from 'qs';
import crypto from 'crypto';
import vnpayConfig from '../config/vnpay.js';
import { Op } from 'sequelize';
import sequelize from '../config/db.js';
import { ORDER_STATUS } from '../constants/orderStatus.js';
import { sendOrderConfirmation } from '../utils/email.js';

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// Import Models để xử lý tạo đơn tại đây
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import CartItem from '../models/CartItem.js';
import Book from '../models/Book.js';
import PromoCode from '../models/PromoCode.js';
import User from '../models/User.js';

// === API 1: TẠO URL VNPAY (Kiêm tạo đơn tạm) ===
const createPaymentUrl = async (req, res) => {
    // Nhận Address/Phone từ body (vì lúc này chưa có đơn)
    const { address, phone, promo_code } = req.body;

    const transaction = await sequelize.transaction();
    try {
        if (!address || !phone) {
            await transaction.rollback();
            return res.error('Vui lòng cung cấp địa chỉ và SĐT', 400);
        }

        // 1. Lấy giỏ hàng để tính tiền
        const cartItems = await CartItem.findAll({
            where: { user_id: req.user.user_id },
            include: [Book],
            transaction
        });

        if (!cartItems.length) {
            await transaction.rollback();
            return res.error('Giỏ hàng trống', 400);
        }

        // 2. Tính toán tổng tiền
        let total_price = 0;
        for (const item of cartItems) {
            const book = item.Book;
            if (!book || book.stock < item.quantity) {
                await transaction.rollback();
                return res.error(`Hết hàng: ${book?.title}`, 400);
            }
            total_price += item.quantity * book.price;
        }

        // 3. Áp mã giảm giá
        let promo_id = null;
        if (promo_code) {
            const promo = await PromoCode.findOne({
                where: { code: promo_code.toUpperCase(), expiry_date: { [Op.gte]: new Date() } }
            });
            if (promo && total_price >= promo.min_amount) {
                total_price -= (total_price * promo.discount_percent) / 100;
                promo_id = promo.promo_id;
            }
        }

        // 4. TẠO ĐƠN "TẠM" (PENDING_PAYMENT)
        // Mục đích: Lấy OrderID để gửi sang VNPay
        const order = await Order.create({
            user_id: req.user.user_id,
            promo_id,
            total_price: Math.round(total_price),
            payment_method: 'VNPay',
            status: ORDER_STATUS.PENDING_PAYMENT, // Trạng thái chờ
            address,
            phone,
            payment_status: 'pending'
        }, { transaction });

        // Lưu Items vào đơn luôn (để chốt giá và số lượng lúc mua)
        for (const item of cartItems) {
            await OrderItem.create({
                order_id: order.order_id,
                book_id: item.book_id,
                quantity: item.quantity,
                price: item.Book.price
            }, { transaction });

            // TRỪ KHO LUÔN (Giữ chỗ). Nếu lỗi sẽ hoàn lại.
            await Book.decrement('stock', {
                by: item.quantity,
                where: { book_id: item.book_id },
                transaction
            });
        }

        // LƯU Ý QUAN TRỌNG: KHÔNG XÓA GIỎ HÀNG Ở ĐÂY
        // Để lỡ thanh toán thất bại, user quay lại vẫn còn giỏ hàng.

        await transaction.commit();

        // 5. TẠO URL VNPAY
        const createDate = moment().format('YYYYMMDDHHmmss');
        const orderId = order.order_id;
        const amount = Math.round(total_price);

        // Lấy IP
        let ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

        let vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: vnpayConfig.vnp_TmnCode,
            vnp_Locale: 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderId, // Mã đơn hàng "tạm"
            vnp_OrderInfo: `Thanh toan don hang #${orderId}`,
            vnp_OrderType: 'other',
            vnp_Amount: amount * 100,
            vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: createDate
        };

        vnp_Params = sortObject(vnp_Params);
        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        vnp_Params['vnp_SecureHash'] = signed;

        const paymentUrl = vnpayConfig.vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false });

        // Trả về URL để Frontend redirect
        return res.success({ paymentUrl }, 'Đã tạo link thanh toán VNPay');

    } catch (err) {
        if (!transaction.finished) await transaction.rollback();
        console.error('Lỗi tạo URL VNPay:', err);
        res.error('Lỗi server', 500);
    }
};

// === API 2: XỬ LÝ KẾT QUẢ TRẢ VỀ ===
const vnpayReturn = async (req, res) => {
    try {
        let vnp_Params = req.query;
        const secureHash = vnp_Params['vnp_SecureHash'];

        // Verify chữ ký
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];
        vnp_Params = sortObject(vnp_Params);
        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        if (secureHash !== signed) {
            return res.redirect(`${clientUrl}/order-failure?code=97&message=Invalid Signature`);
        }

        const orderId = vnp_Params['vnp_TxnRef'];
        const responseCode = vnp_Params['vnp_ResponseCode'];
        const transactionNo = vnp_Params['vnp_TransactionNo'];

        const transaction = await sequelize.transaction();
        try {
            const order = await Order.findByPk(orderId, {
                include: [{ model: OrderItem, include: [Book] }, { model: User }],
                transaction
            });

            if (!order) {
                await transaction.rollback();
                return res.redirect(`${clientUrl}/order-failure?code=01&message=Order Not Found`);
            }

            if (responseCode === '00') {
                // === THÀNH CÔNG ===
                // 1. "Biến" đơn tạm thành đơn thật
                order.status = ORDER_STATUS.PROCESSING;
                order.payment_status = 'paid';
                order.vnpay_transaction_no = transactionNo;
                await order.save({ transaction });

                // 2. Xóa giỏ hàng (Lúc này mới xóa)
                await CartItem.destroy({ where: { user_id: order.user_id }, transaction });

                await transaction.commit();

                // 3. Gửi mail
                try {
                    if (order.User?.email) {
                        const items = order.OrderItems.map(i => ({ title: i.Book.title, quantity: i.quantity, price: i.price }));
                        await sendOrderConfirmation({ to: order.User.email, name: order.User.name, orderId, totalPrice: order.total_price, items });
                    }
                } catch (e) { }

                return res.redirect(`${clientUrl}/order-success?code=00&orderId=${orderId}`);

            } else {
                // === THẤT BẠI ===
                // 1. HOÀN KHO
                for (const item of order.OrderItems) {
                    await Book.increment('stock', {
                        by: item.quantity,
                        where: { book_id: item.book_id },
                        transaction
                    });
                }

                // 2. HARD DELETE ĐƠN HÀNG
                // (Xóa vĩnh viễn khỏi DB để coi như chưa từng tạo đơn)
                await order.destroy({ transaction }); // xóa cả OrderItems do có cascade

                // 3. KHÔNG XÓA GIỎ HÀNG (để user mua lại)

                await transaction.commit();
                return res.redirect(`${clientUrl}/order-failure?code=${responseCode}`);
            }

        } catch (err) {
            if (!transaction.finished) await transaction.rollback();
            console.error(err);
            return res.redirect(`${clientUrl}/order-failure?code=99`);
        }

    } catch (err) {
        console.error(err);
        return res.redirect(`${clientUrl}/order-failure?code=99`);
    }
};

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) str.push(encodeURIComponent(key));
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

export default { createPaymentUrl, vnpayReturn };