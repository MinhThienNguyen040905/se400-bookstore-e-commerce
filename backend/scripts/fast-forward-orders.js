#!/usr/bin/env node

/**
 * Fast-forward orders to DELIVERED for review testing.
 *
 * Usage:
 *   node backend/scripts/fast-forward-orders.js --email=you@x.com
 *   node backend/scripts/fast-forward-orders.js --userId=5
 *   node backend/scripts/fast-forward-orders.js --all          (mọi user, dev DB)
 *   node backend/scripts/fast-forward-orders.js --email=x --dryRun
 */

import 'dotenv/config';
import sequelize from '../config/db.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { ORDER_STATUS } from '../constants/orderStatus.js';

const parseArgs = () => {
    const args = {};
    process.argv.slice(2).forEach((arg) => {
        const [key, value] = arg.replace(/^--/, '').split('=');
        args[key] = value === undefined ? true : value;
    });
    return args;
};

const main = async () => {
    const args = parseArgs();
    const dryRun = Boolean(args.dryRun);

    if (!args.email && !args.userId && !args.all) {
        console.error('❌ Cần truyền --email=... hoặc --userId=... hoặc --all');
        process.exit(1);
    }

    let userId = args.userId ? Number(args.userId) : null;

    if (args.email) {
        const user = await User.findOne({ where: { email: args.email } });
        if (!user) {
            console.error(`❌ Không tìm thấy user với email ${args.email}`);
            process.exit(1);
        }
        userId = user.user_id;
        console.log(`✓ Tìm thấy user: ${user.name} (id=${userId})`);
    }

    const where = { status: ORDER_STATUS.PROCESSING };
    if (userId) where.user_id = userId;

    const orders = await Order.findAll({ where });
    console.log(`\n📦 Tìm thấy ${orders.length} đơn hàng PROCESSING${userId ? ` của user ${userId}` : ' (toàn bộ DB)'}.`);

    if (!orders.length) {
        console.log('Không có gì để cập nhật.');
        process.exit(0);
    }

    orders.forEach((o) => {
        console.log(`  - Order #${o.order_id} | ngày: ${o.order_date} | total: ${o.total_price}`);
    });

    if (dryRun) {
        console.log('\n[DRY RUN] Không thay đổi gì. Bỏ --dryRun để chạy thật.');
        process.exit(0);
    }

    const [count] = await Order.update(
        { status: ORDER_STATUS.DELIVERED },
        { where }
    );

    console.log(`\n✅ Đã chuyển ${count} đơn hàng sang DELIVERED. Bây giờ có thể review sách trong các đơn này.`);
};

main()
    .catch((err) => {
        console.error('❌ Lỗi:', err.message);
        process.exit(1);
    })
    .finally(() => sequelize.close());
