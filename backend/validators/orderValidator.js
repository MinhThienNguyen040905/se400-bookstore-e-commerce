import { ORDER_STATUS_LIST } from '../constants/orderStatus.js';
import AppError from '../errors/AppError.js';
import {
    parseOptionalString,
    parsePositiveInteger,
    parseRequiredString
} from './common.js';

const createCodOrder = (body) => ({
    promoCode: parseOptionalString(body.promo_code),
    paymentMethod: parseRequiredString(body.payment_method, 'payment_method'),
    address: parseRequiredString(body.address, 'address'),
    phone: parseRequiredString(body.phone, 'phone')
});

const updateOrderStatus = (body) => {
    const status = parseRequiredString(body.status, 'status');

    if (!ORDER_STATUS_LIST.includes(status)) {
        throw new AppError('Trang thai khong hop le', 400);
    }

    return {
        orderId: parsePositiveInteger(body.order_id, 'order_id'),
        status
    };
};

const cancelOrder = (body) => ({
    orderId: parsePositiveInteger(body.order_id, 'order_id')
});

export default {
    createCodOrder,
    updateOrderStatus,
    cancelOrder
};
