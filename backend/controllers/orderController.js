// controllers/orderController.js
import orderService from '../services/orderService.js';
import orderValidator from '../validators/orderValidator.js';

const createOrder = async (req, res) => {
    const input = orderValidator.createCodOrder(req.body);
    const order = await orderService.createCodOrder({
        userId: req.user.user_id,
        promoCode: input.promoCode,
        paymentMethod: input.paymentMethod,
        address: input.address,
        phone: input.phone
    });

    res.success(order, 'Dat hang COD thanh cong!', 201);
};

const getOrders = async (req, res) => {
    const orders = await orderService.getOrders({ userId: req.user.user_id });

    res.success(orders, 'Lay danh sach don hang thanh cong');
};

const getMyOrders = async (req, res) => {
    const orders = await orderService.getMyOrders({ userId: req.user.user_id });

    res.success(orders, 'Danh sach don hang ca nhan co timeline');
};

const getAllOrders = async (req, res) => {
    const result = await orderService.getAllOrders({
        page: req.query.page,
        limit: req.query.limit
    });

    res.success(result, 'Lay tat ca don hang thanh cong');
};

const updateOrderStatus = async (req, res) => {
    const input = orderValidator.updateOrderStatus(req.body);
    const order = await orderService.updateOrderStatus({
        orderId: input.orderId,
        status: input.status
    });

    res.success(order, 'Cap nhat trang thai thanh cong');
};

const cancelOrder = async (req, res) => {
    const input = orderValidator.cancelOrder(req.body);
    const result = await orderService.cancelOrder({
        userId: req.user.user_id,
        orderId: input.orderId
    });

    res.success(result, 'Huy don hang thanh cong');
};

const getOrderById = async (req, res) => {
    const order = await orderService.getOrderById({
        orderId: req.params.id,
        userId: req.user.user_id,
        userRole: req.user.role
    });

    res.success(order, 'Lay chi tiet don hang thanh cong');
};

export default {
    createOrder,
    getOrders,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    getOrderById
};
