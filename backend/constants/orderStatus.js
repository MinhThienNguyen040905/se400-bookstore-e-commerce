// constants/orderStatus.js
export const ORDER_STATUS = {
    PENDING_PAYMENT: 'pending_payment',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

export const ORDER_STATUS_LIST = Object.values(ORDER_STATUS);
