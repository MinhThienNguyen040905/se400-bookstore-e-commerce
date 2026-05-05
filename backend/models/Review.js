import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Review = sequelize.define('Review', {
    review_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    comment: DataTypes.TEXT,
    review_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false },
}, {
    uniqueKeys: {
        unique_review: { fields: ['user_id', 'book_id'] },
    },
});


export default Review;