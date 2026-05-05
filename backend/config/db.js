import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import mysql2 from 'mysql2'; // <--- 1. THÊM DÒNG NÀY

const dialectOptions = {};

if (process.env.SSL_CA_PATH) {
    const certPath = path.join(process.cwd(), process.env.SSL_CA_PATH);
    if (fs.existsSync(certPath)) {
        dialectOptions.ssl = { ca: fs.readFileSync(certPath) };
        console.log("✅ Đã load thành công chứng chỉ SSL từ:", certPath);
    } else {
        console.warn(`⚠️ CẢNH BÁO: Không tìm thấy file chứng chỉ tại ${certPath}. Kết nối DB sẽ không dùng SSL.`);
        // Vercel không tìm thấy file, tạm thời bỏ qua SSL để app không bị crash vì lỗi đọc file
    }
}

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectModule: mysql2, // <--- 2. THÊM DÒNG NÀY (BẮT BUỘC CHO VERCEL)
    dialectOptions,
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

export default sequelize;