import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Genre = sequelize.define('Genre', {
    genre_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(50), unique: true, allowNull: false },
});

export default Genre;