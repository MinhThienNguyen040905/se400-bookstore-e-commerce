import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';


const BookGenre = sequelize.define('BookGenre', {}, { timestamps: false });

export default BookGenre;