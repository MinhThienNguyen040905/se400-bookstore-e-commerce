import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ReviewAnalysis = sequelize.define('ReviewAnalysis', {
    analysis_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    review_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    sentiment_label: { type: DataTypes.STRING(20), allowNull: false },
    sentiment_score: { type: DataTypes.DECIMAL(5, 4), allowNull: false },
    confidence: { type: DataTypes.DECIMAL(5, 4), allowNull: false },
    summary: DataTypes.TEXT,
    signals: DataTypes.JSON,
    spam_risk: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'low' },
    spam_reasons: DataTypes.JSON,
    provider: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'fallback' },
    model: DataTypes.STRING(100),
    prompt_version: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'review-sentiment-v1' },
    raw_response: DataTypes.JSON
});

export default ReviewAnalysis;
