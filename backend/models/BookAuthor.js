import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';


const BookAuthor = sequelize.define('BookAuthor', {}, { timestamps: false });


export default BookAuthor;