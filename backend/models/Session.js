// models/Session.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';


const Session = sequelize.define('Session', {
    session_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'user_id'
        },
        onDelete: 'CASCADE' // Xóa session nếu user bị xóa
    },
    refresh_token: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'Sessions',
    timestamps: true, // createdAt, updatedAt
    indexes: [
        { fields: ['user_id'] },
        { fields: ['refresh_token'] },
        { fields: ['expires_at'] } // Dễ query session hết hạn
    ]
});



export default Session;