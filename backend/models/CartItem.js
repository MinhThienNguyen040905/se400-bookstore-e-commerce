import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';


const CartItem = sequelize.define('CartItem', {
    quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
}, {
    indexes: [
        { unique: true, fields: ['user_id', 'book_id'] }
    ]
});


export default CartItem;