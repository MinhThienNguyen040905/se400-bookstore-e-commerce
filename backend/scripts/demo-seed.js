/**
 * Demo seeder — tạo dữ liệu phong phú để demo các tính năng AI của project:
 *   - Sentiment analysis (3-class)
 *   - Ensemble vote (Groq + rule + rating) với agreement cao/thấp
 *   - Aspect-based sentiment (5 aspects)
 *   - Spam detection
 *   - Book insights cache
 *   - Recommendation (orders, wishlist, reviews)
 *   - Admin AI insights (negative trend, rating-sentiment mismatch, top keywords)
 *
 * Giữ nguyên: Books, Authors, Genres, Publishers, BookAuthors, BookGenres.
 * Reset: Users, Sessions, OtpTemps, Orders, OrderItems, CartItems, Wishlists,
 *        PromoCodes, Reviews, ReviewAnalyses, BookInsights.
 *
 * Chạy: node backend/scripts/demo-seed.js
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import db from '../models/index.js';
import '../models/associations.js';

const {
    sequelize,
    User, Book, Order, OrderItem, CartItem, Wishlist,
    Review, ReviewAnalysis, BookInsight, PromoCode,
    Session, OtpTemp
} = db;

const PROMPT_VERSION = 'review-sentiment-v2-ensemble-aspects';
const INSIGHT_PROMPT_VERSION = 'book-insight-v1';
const ASPECT_KEYS = ['content_quality', 'translation', 'print_quality', 'shipping', 'price_value'];

const now = () => new Date();
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

const hash = (plain) => bcrypt.hashSync(plain, 10);

// ----------------------- USERS -----------------------

const USERS = [
    {
        key: 'admin',
        email: 'admin@bookstore.demo',
        password: 'Admin@123',
        name: 'Admin Demo',
        role: 'admin',
        phone: '0900000001',
        address: '1 Admin Street, Ha Noi'
    },
    {
        key: 'customer',
        email: 'customer@bookstore.demo',
        password: 'Customer@123',
        name: 'Khach Hang Chinh',
        role: 'customer',
        phone: '0900000002',
        address: '12 Le Loi, Ha Noi'
    },
    {
        key: 'positive',
        email: 'positive@bookstore.demo',
        password: 'Demo@123',
        name: 'Reviewer Tich Cuc',
        role: 'customer',
        phone: '0900000003',
        address: '34 Nguyen Trai, Ha Noi'
    },
    {
        key: 'negative',
        email: 'negative@bookstore.demo',
        password: 'Demo@123',
        name: 'Reviewer Tieu Cuc',
        role: 'customer',
        phone: '0900000004',
        address: '56 Tran Hung Dao, Ha Noi'
    },
    {
        key: 'mismatch',
        email: 'mismatch@bookstore.demo',
        password: 'Demo@123',
        name: 'Reviewer Mau Thuan',
        role: 'customer',
        phone: '0900000005',
        address: '78 Hai Ba Trung, Ha Noi'
    },
    {
        key: 'aspect',
        email: 'aspect@bookstore.demo',
        password: 'Demo@123',
        name: 'Reviewer Aspect',
        role: 'customer',
        phone: '0900000006',
        address: '90 Phan Dinh Phung, Ha Noi'
    },
    {
        key: 'spammer',
        email: 'spammer@bookstore.demo',
        password: 'Demo@123',
        name: 'Reviewer Spam',
        role: 'customer',
        phone: '0900000007',
        address: '11 Cau Giay, Ha Noi'
    }
];

// ----------------------- REVIEW TEMPLATES -----------------------
// Mỗi entry mô tả một review + analysis tương ứng, đại diện cho 1 use case
// trong báo cáo paper.

const REVIEW_TEMPLATES = {
    // ============ POSITIVE: ensemble agreement CAO ============
    positive_strong: {
        rating: 5,
        comment: 'Sach noi dung rat hay, viet de hieu, bia dep, giao hang nhanh. Hai long tuyet doi!',
        analysis: {
            sentiment_label: 'positive',
            sentiment_score: 0.88,
            confidence: 0.92,
            summary: 'Doc gia rat hai long voi noi dung, hinh thuc va dich vu giao hang.',
            signals: ['noi dung hay', 'de hieu', 'bia dep', 'giao hang nhanh'],
            spam_risk: 'low',
            spam_reasons: [],
            provider: 'groq',
            model: 'llama-3.1-8b-instant',
            aspects: { content_quality: 'positive', translation: 'none', print_quality: 'positive', shipping: 'positive', price_value: 'none' },
            ensemble_agreement: 1.00,
            ensemble_sources: { groq: 'positive', rule: 'positive', rating: 'positive' }
        }
    },
    positive_content: {
        rating: 5,
        comment: 'Noi dung sach thuc su xuat sac, mo rong tu duy va ung dung duoc vao thuc te.',
        analysis: {
            sentiment_label: 'positive', sentiment_score: 0.82, confidence: 0.90,
            summary: 'Khen ngoi noi dung sach huu ich, co the ap dung thuc te.',
            signals: ['noi dung xuat sac', 'mo rong tu duy', 'ung dung thuc te'],
            spam_risk: 'low', spam_reasons: [],
            provider: 'groq', model: 'llama-3.1-8b-instant',
            aspects: { content_quality: 'positive', translation: 'none', print_quality: 'none', shipping: 'none', price_value: 'none' },
            ensemble_agreement: 1.00,
            ensemble_sources: { groq: 'positive', rule: 'positive', rating: 'positive' }
        }
    },
    positive_translation: {
        rating: 5,
        comment: 'Sach dich rat muot, van phong tieng Viet tu nhien, doc khong bi vap.',
        analysis: {
            sentiment_label: 'positive', sentiment_score: 0.80, confidence: 0.88,
            summary: 'Doc gia danh gia cao chat luong dich thuat.',
            signals: ['dich muot', 'van phong tu nhien'],
            spam_risk: 'low', spam_reasons: [],
            provider: 'groq', model: 'llama-3.1-8b-instant',
            aspects: { content_quality: 'positive', translation: 'positive', print_quality: 'none', shipping: 'none', price_value: 'none' },
            ensemble_agreement: 1.00,
            ensemble_sources: { groq: 'positive', rule: 'positive', rating: 'positive' }
        }
    },

    // ============ NEGATIVE ============
    negative_print: {
        rating: 2,
        comment: 'Giay in mong, bia rach goc khi nhan hang. Noi dung tam duoc nhung chat luong in te.',
        analysis: {
            sentiment_label: 'negative', sentiment_score: -0.55, confidence: 0.85,
            summary: 'Doc gia phan nan chat luong in va dong goi.',
            signals: ['giay mong', 'bia rach', 'chat luong in te'],
            spam_risk: 'low', spam_reasons: [],
            provider: 'groq', model: 'llama-3.1-8b-instant',
            aspects: { content_quality: 'neutral', translation: 'none', print_quality: 'negative', shipping: 'negative', price_value: 'none' },
            ensemble_agreement: 1.00,
            ensemble_sources: { groq: 'negative', rule: 'negative', rating: 'negative' }
        }
    },
    negative_translation: {
        rating: 2,
        comment: 'Dich qua may, nhieu cau toi nghia, doc rat met. Khong dang gia tien.',
        analysis: {
            sentiment_label: 'negative', sentiment_score: -0.62, confidence: 0.88,
            summary: 'Doc gia khong hai long voi ban dich va gia tien.',
            signals: ['dich may', 'cau toi nghia', 'khong dang gia'],
            spam_risk: 'low', spam_reasons: [],
            provider: 'groq', model: 'llama-3.1-8b-instant',
            aspects: { content_quality: 'neutral', translation: 'negative', print_quality: 'none', shipping: 'none', price_value: 'negative' },
            ensemble_agreement: 1.00,
            ensemble_sources: { groq: 'negative', rule: 'negative', rating: 'negative' }
        }
    },
    negative_shipping: {
        rating: 1,
        comment: 'Giao hang cham 2 tuan, hop bi bep nat, sach bi gap goc. Rat that vong.',
        analysis: {
            sentiment_label: 'negative', sentiment_score: -0.75, confidence: 0.91,
            summary: 'Trai nghiem giao hang va dong goi rat te.',
            signals: ['giao cham', 'hop bep', 'sach gap goc', 'that vong'],
            spam_risk: 'low', spam_reasons: [],
            provider: 'groq', model: 'llama-3.1-8b-instant',
            aspects: { content_quality: 'none', translation: 'none', print_quality: 'negative', shipping: 'negative', price_value: 'none' },
            ensemble_agreement: 1.00,
            ensemble_sources: { groq: 'negative', rule: 'negative', rating: 'negative' }
        }
    },

    // ============ NEUTRAL ============
    neutral_mixed: {
        rating: 3,
        comment: 'Sach o muc on, mot vai chuong hay nhung cung co phan lap lai. Gia hop ly.',
        analysis: {
            sentiment_label: 'neutral', sentiment_score: 0.05, confidence: 0.70,
            summary: 'Y kien trung lap: noi dung trung binh, gia chap nhan duoc.',
            signals: ['muc on', 'lap lai', 'gia hop ly'],
            spam_risk: 'low', spam_reasons: [],
            provider: 'groq', model: 'llama-3.1-8b-instant',
            aspects: { content_quality: 'neutral', translation: 'none', print_quality: 'none', shipping: 'none', price_value: 'positive' },
            ensemble_agreement: 1.00,
            ensemble_sources: { groq: 'neutral', rule: 'neutral', rating: 'neutral' }
        }
    },

    // ============ RATING-SENTIMENT MISMATCH (demo paper §5 spam detection) ============
    // Rating cao nhung comment chê -> ensemble agreement THAP
    mismatch_high_rating_negative: {
        rating: 5,
        comment: 'Khong tot nhu mong doi, noi dung nong, in xau, khong dang dong tien.',
        analysis: {
            sentiment_label: 'negative', sentiment_score: -0.45, confidence: 0.60,
            summary: 'Mau thuan: rating 5 nhung noi dung comment tieu cuc.',
            signals: ['khong tot', 'noi dung nong', 'in xau'],
            spam_risk: 'high',
            spam_reasons: ['rating va sentiment mau thuan', 'comment tieu cuc voi rating cao'],
            provider: 'groq', model: 'llama-3.1-8b-instant',
            aspects: { content_quality: 'negative', translation: 'none', print_quality: 'negative', shipping: 'none', price_value: 'negative' },
            ensemble_agreement: 0.50, // Groq+rule=negative (0.7), rating=positive (0.3) -> agreement = 0.7/1.0
            ensemble_sources: { groq: 'negative', rule: 'negative', rating: 'positive' }
        }
    },
    mismatch_low_rating_positive: {
        rating: 1,
        comment: 'Thuc su hay, noi dung sau sac, dich tot. Rat khuyen doc.',
        analysis: {
            sentiment_label: 'positive', sentiment_score: 0.55, confidence: 0.65,
            summary: 'Mau thuan: rating 1 nhung comment khen het loi.',
            signals: ['hay', 'sau sac', 'dich tot'],
            spam_risk: 'medium',
            spam_reasons: ['rating va sentiment mau thuan'],
            provider: 'groq', model: 'llama-3.1-8b-instant',
            aspects: { content_quality: 'positive', translation: 'positive', print_quality: 'none', shipping: 'none', price_value: 'none' },
            ensemble_agreement: 0.50,
            ensemble_sources: { groq: 'positive', rule: 'positive', rating: 'negative' }
        }
    },

    // ============ SPAM ============
    spam_short: {
        rating: 5,
        comment: 'tot',
        analysis: {
            sentiment_label: 'positive', sentiment_score: 0.40, confidence: 0.35,
            summary: 'Comment qua ngan, khong du noi dung.',
            signals: ['tot'],
            spam_risk: 'high',
            spam_reasons: ['comment qua ngan', 'thieu noi dung'],
            provider: 'fallback', model: null,
            aspects: { content_quality: 'none', translation: 'none', print_quality: 'none', shipping: 'none', price_value: 'none' },
            ensemble_agreement: 1.00,
            ensemble_sources: { groq: null, rule: 'positive', rating: 'positive' }
        }
    },
    spam_link: {
        rating: 5,
        comment: 'Sach hay, mua them tai https://shop-spam.example.com co giam gia!!!',
        analysis: {
            sentiment_label: 'positive', sentiment_score: 0.30, confidence: 0.40,
            summary: 'Comment chua link quang cao.',
            signals: ['sach hay', 'co link'],
            spam_risk: 'high',
            spam_reasons: ['co link quang cao', 'noi dung quang cao'],
            provider: 'groq', model: 'llama-3.1-8b-instant',
            aspects: { content_quality: 'none', translation: 'none', print_quality: 'none', shipping: 'none', price_value: 'none' },
            ensemble_agreement: 1.00,
            ensemble_sources: { groq: 'positive', rule: 'positive', rating: 'positive' }
        }
    },

    // ============ FALLBACK ONLY (demo khi Groq tat) ============
    fallback_positive: {
        rating: 4,
        comment: 'Sach hay, doc duoc, giao hang on.',
        analysis: {
            sentiment_label: 'positive', sentiment_score: 0.55, confidence: 0.55,
            summary: null,
            signals: ['hay', 'on'],
            spam_risk: 'low', spam_reasons: [],
            provider: 'fallback', model: null,
            aspects: { content_quality: 'none', translation: 'none', print_quality: 'none', shipping: 'none', price_value: 'none' },
            ensemble_agreement: 1.00,
            ensemble_sources: { groq: null, rule: 'positive', rating: 'positive' }
        }
    },
    fallback_negative: {
        rating: 2,
        comment: 'Khong tot, te qua.',
        analysis: {
            sentiment_label: 'negative', sentiment_score: -0.55, confidence: 0.55,
            summary: null,
            signals: ['khong tot', 'te'],
            spam_risk: 'low', spam_reasons: [],
            provider: 'fallback', model: null,
            aspects: { content_quality: 'none', translation: 'none', print_quality: 'none', shipping: 'none', price_value: 'none' },
            ensemble_agreement: 1.00,
            ensemble_sources: { groq: null, rule: 'negative', rating: 'negative' }
        }
    }
};

// Map: mỗi user gắn với 1 phong cách review + danh sách review template lặp lại
// trên các sách khác nhau (đa dạng để có insight).
const REVIEW_PLAN = [
    { userKey: 'positive', templateKeys: ['positive_strong', 'positive_content', 'positive_translation', 'positive_strong', 'positive_content'] },
    { userKey: 'negative', templateKeys: ['negative_print', 'negative_translation', 'negative_shipping', 'negative_print', 'negative_translation'] },
    { userKey: 'mismatch', templateKeys: ['mismatch_high_rating_negative', 'mismatch_low_rating_positive', 'neutral_mixed', 'mismatch_high_rating_negative'] },
    { userKey: 'aspect',   templateKeys: ['positive_translation', 'negative_print', 'negative_translation', 'positive_content', 'neutral_mixed'] },
    { userKey: 'spammer',  templateKeys: ['spam_short', 'spam_link', 'spam_short'] },
    { userKey: 'customer', templateKeys: ['fallback_positive', 'fallback_negative', 'positive_strong'] }
];

// ----------------------- MAIN -----------------------

async function main() {
    console.log('=== Demo seeder bat dau ===');

    await sequelize.authenticate();
    console.log('Da ket noi DB.');

    // 1) WIPE — giữ Books, Authors, Genres, Publishers, BookAuthors, BookGenres
    console.log('\n[1/5] Xoa du lieu cu...');
    const wipeOrder = [
        'Sessions', 'OtpTemps',
        'ReviewAnalyses', 'BookInsights',
        'Reviews',
        'OrderItems', 'Orders',
        'CartItems', 'Wishlists',
        'PromoCodes',
        'Users'
    ];
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of wipeOrder) {
        await sequelize.query(`TRUNCATE TABLE \`${table}\``);
        console.log(`  - truncated ${table}`);
    }
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // 2) USERS
    console.log('\n[2/5] Tao users...');
    const userMap = {};
    for (const u of USERS) {
        const created = await User.create({
            email: u.email,
            password: u.password, // hook bcrypt sẽ hash
            name: u.name,
            role: u.role,
            phone: u.phone,
            address: u.address
        });
        userMap[u.key] = created.user_id;
        console.log(`  - ${u.email} (id=${created.user_id}, role=${u.role})`);
    }

    // 3) PROMO CODES
    console.log('\n[3/5] Tao promo codes...');
    const promos = [
        { code: 'WELCOME10',  discount_percent: 10, min_amount: 100000, expiry_date: daysAgo(-30) },
        { code: 'READER20',   discount_percent: 20, min_amount: 200000, expiry_date: daysAgo(-60) },
        { code: 'EXPIRED50',  discount_percent: 50, min_amount: 50000,  expiry_date: daysAgo(15)  },
        { code: 'DEMO5',      discount_percent: 5,  min_amount: 0,      expiry_date: daysAgo(-90) }
    ];
    for (const p of promos) {
        await PromoCode.create(p);
        console.log(`  - ${p.code} (${p.discount_percent}%)`);
    }

    // 4) Lấy danh sách book_id để gán reviews/orders
    const books = await Book.findAll({
        order: [['stock', 'DESC']],
        limit: 30,
        attributes: ['book_id', 'title', 'price', 'stock']
    });
    if (books.length < 10) throw new Error('Khong du sach de seed demo.');
    const pickedBooks = books.slice(0, 12);
    console.log(`\nDung ${pickedBooks.length} sach dau (theo stock cao nhat).`);

    // 5) ORDERS + ORDER ITEMS + REVIEWS + REVIEW ANALYSES
    console.log('\n[4/5] Tao orders + reviews + analyses...');
    let totalReviews = 0;
    let totalOrders = 0;

    for (const plan of REVIEW_PLAN) {
        const userId = userMap[plan.userKey];
        for (let i = 0; i < plan.templateKeys.length; i++) {
            const tpl = REVIEW_TEMPLATES[plan.templateKeys[i]];
            const book = pickedBooks[i % pickedBooks.length];

            // Tạo order DELIVERED để review hợp lệ (reviewService yêu cầu user đã mua)
            const orderDate = daysAgo(30 + i * 3 + Math.floor(Math.random() * 5));
            const unitPrice = parseFloat(book.price);
            const totalPrice = unitPrice * 1;

            const order = await Order.create({
                user_id: userId,
                total_price: totalPrice,
                status: 'delivered',
                order_date: orderDate,
                payment_method: i % 2 === 0 ? 'COD' : 'VNPay',
                payment_status: 'paid',
                address: USERS.find(u => u.key === plan.userKey).address,
                phone: USERS.find(u => u.key === plan.userKey).phone,
                vnpay_transaction_no: i % 2 === 0 ? null : `VNP${Date.now()}${i}`
            });
            await OrderItem.create({
                order_id: order.order_id,
                book_id: book.book_id,
                quantity: 1,
                price: unitPrice
            });
            totalOrders++;

            // Tạo review (review_date trong window 7 ngày cho 1 số → để admin trend nhìn thấy)
            const reviewDate = i === 0
                ? daysAgo(Math.floor(Math.random() * 7))         // recent
                : daysAgo(7 + Math.floor(Math.random() * 30));   // older

            const review = await Review.create({
                user_id: userId,
                book_id: book.book_id,
                rating: tpl.rating,
                comment: tpl.comment,
                review_date: reviewDate
            }).catch(async (err) => {
                // Duplicate (user_id, book_id) → bỏ qua silent
                if (err.name === 'SequelizeUniqueConstraintError') return null;
                throw err;
            });
            if (!review) continue;

            await ReviewAnalysis.create({
                review_id: review.review_id,
                sentiment_label: tpl.analysis.sentiment_label,
                sentiment_score: tpl.analysis.sentiment_score,
                confidence: tpl.analysis.confidence,
                summary: tpl.analysis.summary,
                signals: tpl.analysis.signals,
                spam_risk: tpl.analysis.spam_risk,
                spam_reasons: tpl.analysis.spam_reasons,
                provider: tpl.analysis.provider,
                model: tpl.analysis.model,
                prompt_version: PROMPT_VERSION,
                raw_response: null,
                aspects: tpl.analysis.aspects,
                ensemble_agreement: tpl.analysis.ensemble_agreement,
                ensemble_sources: tpl.analysis.ensemble_sources
            });
            totalReviews++;
        }
    }
    console.log(`  - tao ${totalOrders} orders + ${totalReviews} reviews + analyses`);

    // Thêm 1 order pending COD cho customer chính (để demo my-orders)
    const pendingBook = pickedBooks[5];
    const pendingOrder = await Order.create({
        user_id: userMap.customer,
        total_price: parseFloat(pendingBook.price) * 2,
        status: 'processing',
        order_date: daysAgo(1),
        payment_method: 'COD',
        payment_status: 'pending',
        address: '12 Le Loi, Ha Noi',
        phone: '0900000002'
    });
    await OrderItem.create({
        order_id: pendingOrder.order_id, book_id: pendingBook.book_id,
        quantity: 2, price: parseFloat(pendingBook.price)
    });
    console.log(`  - them 1 order processing cho customer chinh`);

    // CART items cho customer chính (để demo /cart)
    console.log('\n[Cart] Them cart items cho customer chinh...');
    for (let i = 6; i < 9; i++) {
        await CartItem.create({
            user_id: userMap.customer,
            book_id: pickedBooks[i].book_id,
            quantity: 1
        });
    }

    // WISHLIST cho nhiều user (tin hieu cho recommendation)
    console.log('\n[Wishlist] Them wishlist...');
    const wishlistPlan = [
        { userKey: 'customer', indices: [0, 1, 4, 7] },
        { userKey: 'positive', indices: [0, 2, 5] },
        { userKey: 'negative', indices: [3, 6] },
        { userKey: 'aspect',   indices: [0, 1, 8] }
    ];
    for (const w of wishlistPlan) {
        for (const idx of w.indices) {
            await Wishlist.create({
                user_id: userMap[w.userKey],
                book_id: pickedBooks[idx].book_id
            }).catch(() => null);
        }
    }

    // BOOK INSIGHTS — pre-cache cho top 5 sách
    console.log('\n[5/5] Tao BookInsights cache cho top sach...');
    const topBooksForInsight = pickedBooks.slice(0, 5);
    for (const book of topBooksForInsight) {
        const reviewCount = await Review.count({ where: { book_id: book.book_id } });
        if (reviewCount === 0) continue;

        const analyses = await ReviewAnalysis.findAll({
            include: [{ model: Review, where: { book_id: book.book_id }, attributes: [] }]
        });
        const dist = { positive: 0, neutral: 0, negative: 0 };
        const positiveSignals = new Set();
        const negativeSignals = new Set();
        for (const a of analyses) {
            dist[a.sentiment_label] = (dist[a.sentiment_label] || 0) + 1;
            const sigs = Array.isArray(a.signals) ? a.signals : [];
            if (a.sentiment_label === 'positive') sigs.forEach(s => positiveSignals.add(s));
            if (a.sentiment_label === 'negative') sigs.forEach(s => negativeSignals.add(s));
        }

        const totalAnalyzed = dist.positive + dist.neutral + dist.negative;
        const positiveRatio = totalAnalyzed ? dist.positive / totalAnalyzed : 0;

        await BookInsight.create({
            book_id: book.book_id,
            summary: positiveRatio >= 0.6
                ? `Da so doc gia khen "${book.title}" ve noi dung va trinh bay.`
                : `Y kien doc gia ve "${book.title}" kha trai chieu, can chu y mot so diem ve chat luong san pham.`,
            positive_points: Array.from(positiveSignals).slice(0, 5),
            negative_points: Array.from(negativeSignals).slice(0, 5),
            reader_fit: 'Phu hop voi doc gia tim kiem trai nghiem doc nghiem tuc.',
            recommendation_hint: positiveRatio >= 0.6
                ? 'Khuyen doc neu ban quan tam the loai nay.'
                : 'Can can nhac, doc them review chi tiet truoc khi mua.',
            sentiment_distribution: dist,
            review_count: reviewCount,
            provider: 'fallback',
            model: null,
            prompt_version: INSIGHT_PROMPT_VERSION,
            generated_at: now()
        });
        console.log(`  - insight cho book_id=${book.book_id} (${reviewCount} reviews)`);
    }

    console.log('\n=== Demo seeder hoan thanh ===');
    console.log('Tai khoan chi tiet xem o file DEMO_CREDENTIALS.md (root project).');

    await sequelize.close();
}

main().catch(async (err) => {
    console.error('LOI seeder:', err);
    try { await sequelize.close(); } catch {}
    process.exit(1);
});
