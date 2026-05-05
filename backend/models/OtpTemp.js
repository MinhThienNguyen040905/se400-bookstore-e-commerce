// models/OtpTemp.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const OtpTemp = sequelize.define('OtpTemp', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false },
  otp: { type: DataTypes.STRING(6), allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false }
}, {
  tableName: 'OtpTemps',
  timestamps: true
});

export default OtpTemp;