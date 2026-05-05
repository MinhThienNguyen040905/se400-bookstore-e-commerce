import fs from 'fs';
import 'dotenv/config';

function makeDialectOptions() {
    // Trả về object ssl chỉ khi có path, tránh lỗi đọc file nếu không thiết lập
    if (process.env.SSL_CA_PATH) {
        return { ssl: { ca: fs.readFileSync(process.env.SSL_CA_PATH) } };
    }
    return {};
}

export default {
    development: {
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        dialectOptions: makeDialectOptions(),
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        dialectOptions: makeDialectOptions(),
    },
};