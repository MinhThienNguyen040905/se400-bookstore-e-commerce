import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
    user_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(100), unique: true, allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: false },
    address: DataTypes.STRING(255),
    phone: DataTypes.STRING(20),
    role: { type: DataTypes.ENUM('admin', 'customer'), defaultValue: 'customer', allowNull: false },
    avatar: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null
    } // ← THÊM DÒNG NÀY
}, {
    hooks: {
        beforeCreate: async (user) => {
            user.password = await bcrypt.hash(user.password, 10);
        },
    },
});

User.prototype.validPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

export default User;