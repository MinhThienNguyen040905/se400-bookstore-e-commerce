import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const BookInsight = sequelize.define('BookInsight', {
    insight_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    book_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    summary: DataTypes.TEXT,
    positive_points: DataTypes.JSON,
    negative_points: DataTypes.JSON,
    reader_fit: DataTypes.TEXT,
    recommendation_hint: DataTypes.TEXT,
    sentiment_distribution: DataTypes.JSON,
    review_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    provider: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'fallback' },
    model: DataTypes.STRING(100),
    prompt_version: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'book-insight-v1' },
    generated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false }
});

export default BookInsight;
