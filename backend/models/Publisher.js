import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Publisher = sequelize.define('Publisher', {
    publisher_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), unique: true, allowNull: false },
});

export default Publisher;