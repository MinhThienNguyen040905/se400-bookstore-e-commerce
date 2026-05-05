import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const OrderItem = sequelize.define('OrderItem', {
    order_item_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get() {
            const value = this.getDataValue('price');
            return value == null ? null : parseFloat(value);
        }
    },
});


export default OrderItem;