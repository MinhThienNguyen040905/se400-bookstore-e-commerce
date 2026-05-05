import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Wishlist = sequelize.define('Wishlist', {
    wishlist_id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    user_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    book_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    }
}, {
    uniqueKeys: {
        unique_wishlist: { 
            fields: ['user_id', 'book_id'] 
        }
    },
    timestamps: true
});

export default Wishlist;
