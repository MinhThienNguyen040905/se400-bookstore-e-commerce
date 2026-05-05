// controllers/orderController.js
import { Op } from 'sequelize';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Book from '../models/Book.js';
import PromoCode from '../models/PromoCode.js';
import CartItem from '../models/CartItem.js';
import User from '../models/User.js';
import sequelize from '../config/db.js';
import { ORDER_STATUS, ORDER_STATUS_LIST } from '../constants/orderStatus.js';
import { sendOrderConfirmation } from '../utils/email.js';

const TIMELINE_STEPS = [
    { status: ORDER_STATUS.PROCESSING, title: 'Đang xử lý', description: 'Đơn hàng đang được xác nhận' },
    { status: ORDER_STATUS.SHIPPED, title: 'Đang vận chuyển', description: 'Đơn hàng đang được giao' },
    { status: ORDER_STATUS.DELIVERED, title: 'Đã giao hàng', description: 'Đơn hàng đã đến tay bạn' }
];

const STATUS_OFFSETS = {
    [ORDER_STATUS.PROCESSING]: 0,
    [ORDER_STATUS.SHIPPED]: 2,
    [ORDER_STATUS.DELIVERED]: 4
};

const buildStatusHistory = (currentStatus, orderDate) => {
    if (!orderDate) return [];
    const baseDate = new Date(orderDate);

    if (currentStatus === ORDER_STATUS.CANCELLED) {
        return [
            {
                status: ORDER_STATUS.CANCELLED,
                title: 'Đơn hàng đã bị hủy',
                description: 'Liên hệ CSKH để biết thêm chi tiết',
                completedAt: baseDate,
                isCompleted: true
            }
        ];
    }

    const currentIndex = TIMELINE_STEPS.findIndex((step) => step.status === currentStatus);
    const steps = currentIndex >= 0 ? TIMELINE_STEPS.slice(0, currentIndex + 1) : TIMELINE_STEPS;

    return steps.map((step, index) => {
        const completedDate = new Date(baseDate);
        completedDate.setDate(completedDate.getDate() + (STATUS_OFFSETS[step.status] ?? 0));
        return {
            status: step.status,
            title: step.title,
            description: step.description,
            completedAt: completedDate,
            isCompleted: index <= currentIndex
        };
    });
};

// === CHỈ XỬ LÝ TẠO ĐƠN COD ===
const createOrder = async (req, res) => {
    const { promo_code, payment_method, address, phone } = req.body;

    // 1. Chỉ chấp nhận COD ở API này
    if (payment_method !== 'COD') {
        return res.error('API này chỉ dành cho thanh toán COD. Vui lòng dùng API VNPay riêng.', 400);
    }

    const transaction = await sequelize.transaction();

    try {
        // Validation cơ bản
        if (!address || !phone) {
            await transaction.rollback();
            return res.error('Thiếu địa chỉ hoặc số điện thoại', 400);
        }

        const user = await User.findByPk(req.user.user_id);
        if (!user) {
            await transaction.rollback();
            return res.error('Không tìm thấy User', 404);
        }

        // Lấy giỏ hàng
        const cartItems = await CartItem.findAll({
            where: { user_id: req.user.user_id },
            include: [Book],
            transaction
        });

        if (!cartItems.length) {
            await transaction.rollback();
            return res.error('Giỏ hàng trống', 400);
        }

        // Tính tiền & Check tồn kho
        let total_price = 0;
        for (const item of cartItems) {
            const book = await Book.findByPk(item.book_id, { lock: transaction.LOCK.UPDATE, transaction });
            if (!book || book.stock < item.quantity) {
                await transaction.rollback();
                return res.error(`Hết hàng: ${book?.title}`, 400);
            }
            total_price += item.quantity * book.price;
        }

        // Check mã giảm giá
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

        // TẠO ĐƠN HÀNG (STATUS: PROCESSING LUÔN)
        const order = await Order.create({
            user_id: req.user.user_id,
            promo_id,
            total_price: Math.round(total_price),
            payment_method: 'COD',
            status: ORDER_STATUS.PROCESSING,
            address,
            phone,
            payment_status: 'pending'
        }, { transaction });

        // TẠO ORDER ITEMS & TRỪ KHO
        for (const item of cartItems) {
            const book = await Book.findByPk(item.book_id, { transaction });
            await OrderItem.create({
                order_id: order.order_id,
                book_id: item.book_id,
                quantity: item.quantity,
                price: book.price
            }, { transaction });

            await Book.decrement('stock', {
                by: item.quantity,
                where: { book_id: item.book_id },
                transaction
            });
        }

        // XÓA GIỎ HÀNG
        await CartItem.destroy({ where: { user_id: req.user.user_id }, transaction });

        await transaction.commit();

        // GỬI EMAIL
        try {
            if (user.email) {
                // Lấy lại data để gửi mail đẹp
                const fullOrder = await Order.findByPk(order.order_id, { include: [{ model: OrderItem, include: [Book] }] });
                const itemsForMail = fullOrder.OrderItems.map(i => ({ title: i.Book.title, quantity: i.quantity, price: i.price }));
                await sendOrderConfirmation({
                    to: user.email, name: user.name, orderId: order.order_id, totalPrice: fullOrder.total_price, items: itemsForMail
                });
            }
        } catch (e) { console.error('Lỗi gửi mail:', e); }

        return res.success({ order_id: order.order_id }, 'Đặt hàng COD thành công!', 201);

    } catch (err) {
        if (!transaction.finished) await transaction.rollback();
        console.error('Lỗi COD:', err);
        res.error('Lỗi server', 500);
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { user_id: req.user.user_id },
            include: [
                { model: OrderItem, include: [Book] },
                { model: PromoCode, attributes: ['code', 'discount_percent'] }
            ],
            order: [['order_date', 'DESC']]
        });
        res.success(orders, 'Lấy danh sách đơn hàng thành công');
    } catch (err) {
        console.error(err);
        res.error('Lỗi server', 500);
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { user_id: req.user.user_id },
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

        const payload = orders.map((order) => ({
            order_id: order.order_id,
            total_price: order.total_price,
            status: order.status,
            order_date: order.order_date,
            promo: order.PromoCode
                ? {
                    code: order.PromoCode.code,
                    discount_percent: order.PromoCode.discount_percent
                }
                : null,
            order_items: (order.OrderItems || []).map((item) => ({
                order_item_id: item.order_item_id,
                quantity: item.quantity,
                price: item.price,
                book: item.Book
                    ? {
                        book_id: item.Book.book_id,
                        title: item.Book.title,
                        cover_image: item.Book.cover_image
                    }
                    : null
            })),
            status_history: buildStatusHistory(order.status, order.order_date)
        }));

        res.success(payload, 'Danh sách đơn hàng cá nhân có timeline');
    } catch (err) {
        console.error(err);
        res.error('Lỗi server', 500);
    }
};

const getAllOrders = async (req, res) => {
    try {
        // 1. Lấy tham số phân trang từ Query String
        // Mặc định: trang 1, 10 đơn/trang
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // 2. Query DB với phân trang
        // Sử dụng findAndCountAll để lấy cả dữ liệu và tổng số lượng
        const { count, rows } = await Order.findAndCountAll({
            distinct: true, // Quan trọng: Đếm chính xác số Order (tránh bị nhân bản do join OrderItems)
            limit: limit,
            offset: offset,
            order: [['order_date', 'DESC']],
            include: [
                {
                    model: OrderItem,
                    include: [
                        {
                            model: Book,
                            attributes: ['book_id', 'title', 'cover_image'] // Chỉ lấy thông tin cần thiết
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

        // 3. Trả về kết quả kèm Metadata phân trang
        res.success({
            orders: rows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                pageSize: limit
            }
        }, 'Lấy tất cả đơn hàng thành công');

    } catch (err) {
        console.error('GetAllOrders error:', err);
        res.error('Lỗi server', 500);
    }
};

const updateOrderStatus = async (req, res) => {

    const { order_id, status } = req.body;
    if (!ORDER_STATUS_LIST.includes(status)) {
        return res.error('Trạng thái không hợp lệ', 400);
    }

    try {
        const order = await Order.findByPk(order_id);
        if (!order) return res.error('Không tìm thấy đơn hàng', 404);

        order.status = status;
        await order.save();

        res.success(order, 'Cập nhật trạng thái thành công');
    } catch (err) {
        console.error(err);
        res.error('Lỗi server', 500);
    }
};

// === NGƯỜI DÙNG TỰ HỦY ĐƠN (Lấy ID từ Body) ===
const cancelOrder = async (req, res) => {
    // 1. LẤY order_id TỪ BODY
    const { order_id } = req.body;
    const userId = req.user.user_id;

    // Validate sơ bộ
    if (!order_id) {
        return res.error('Vui lòng cung cấp mã đơn hàng (order_id)', 400);
    }

    const transaction = await sequelize.transaction();

    try {
        // 2. Tìm đơn hàng
        const order = await Order.findOne({
            where: {
                order_id: order_id,
                user_id: userId // Chỉ tìm đơn của chính user này
            },
            include: [{ model: OrderItem }],
            transaction
        });

        if (!order) {
            await transaction.rollback();
            return res.error('Đơn hàng không tồn tại hoặc không thuộc về bạn', 404);
        }

        // 3. Kiểm tra điều kiện trạng thái
        if (order.status !== ORDER_STATUS.PROCESSING) {
            await transaction.rollback();
            return res.error('Chỉ có thể hủy đơn hàng khi đang xử lý.', 400);
        }

        // 4. Cập nhật trạng thái
        order.status = ORDER_STATUS.CANCELLED;
        await order.save({ transaction });

        // 5. Hoàn kho
        for (const item of order.OrderItems) {
            await Book.increment('stock', {
                by: item.quantity,
                where: { book_id: item.book_id },
                transaction
            });
        }

        await transaction.commit();
        res.success({ order_id: order.order_id }, 'Hủy đơn hàng thành công');

    } catch (err) {
        if (!transaction.finished) await transaction.rollback();
        console.error('Lỗi hủy đơn:', err);
        res.error('Lỗi server', 500);
    }
};

const getOrderById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.user_id;
    const userRole = req.user.role;

    try {
        const order = await Order.findByPk(id, {
            include: [
                {
                    model: OrderItem,
                    include: [
                        {
                            model: Book,
                            attributes: ['book_id', 'title', 'cover_image', 'price'] // Lấy thông tin sách
                        }
                    ]
                },
                {
                    model: PromoCode,
                    attributes: ['code', 'discount_percent', 'min_amount']
                },
                {
                    model: User,
                    attributes: ['user_id', 'name', 'email', 'phone', 'address'] // Lấy thông tin người mua
                }
            ]
        });

        if (!order) {
            return res.error('Đơn hàng không tồn tại', 404);
        }

        // --- CHECK QUYỀN: Chỉ Admin hoặc Chính chủ mới được xem ---
        if (userRole !== 'admin' && order.user_id !== userId) {
            return res.error('Bạn không có quyền xem đơn hàng này', 403);
        }

        // Format lại dữ liệu trả về cho đẹp (nếu cần)
        // Kết hợp logic Timeline (nếu bạn muốn dùng lại hàm buildStatusHistory)
        const result = {
            order_id: order.order_id,
            status: order.status,
            total_price: Number(order.total_price),
            payment_method: order.payment_method,
            address: order.address,
            phone: order.phone,
            order_date: order.order_date,
            user: order.User, // Thông tin người mua
            promo: order.PromoCode, // Thông tin mã giảm giá
            items: order.OrderItems.map(item => ({
                order_item_id: item.order_item_id,
                quantity: item.quantity,
                price: Number(item.price),
                book: item.Book
            })),
            // Tái sử dụng hàm buildStatusHistory (nếu đã khai báo trong file này)
            // Nếu chưa có hàm buildStatusHistory thì bỏ dòng này đi
            status_history: (typeof buildStatusHistory === 'function')
                ? buildStatusHistory(order.status, order.order_date)
                : []
        };

        res.success(result, 'Lấy chi tiết đơn hàng thành công');

    } catch (err) {
        console.error('GetOrderById error:', err);
        res.error('Lỗi server', 500);
    }
};

export default { createOrder, getOrders, getMyOrders, getAllOrders, updateOrderStatus, cancelOrder, getOrderById };
