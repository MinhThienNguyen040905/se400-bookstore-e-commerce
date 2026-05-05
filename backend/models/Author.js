import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Author = sequelize.define('Author', {
    author_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
});

export default Author;