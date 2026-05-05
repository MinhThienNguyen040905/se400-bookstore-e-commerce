// models/Order.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Order = sequelize.define('Order', {
    order_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 },
        get() {
            const value = this.getDataValue('total_price');
            return value == null ? null : parseFloat(value);
        }
    },
    status: {
        type: DataTypes.ENUM('pending_payment', 'processing', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'processing',
        allowNull: false
    },
    order_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false },
    payment_method: { type: DataTypes.STRING(50), allowNull: false },
    // THÊM 2 TRƯỜNG MỚI
    address: { type: DataTypes.STRING(255), allowNull: true },
    phone: { type: DataTypes.STRING(20), allowNull: true },
    // THÊM CÁC TRƯỜNG CHO VNPAY
    payment_status: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'pending',
        comment: 'Trạng thái thanh toán: pending, paid, failed'
    },
    vnpay_transaction_no: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Mã giao dịch VNPay'
    },
});

export default Order;