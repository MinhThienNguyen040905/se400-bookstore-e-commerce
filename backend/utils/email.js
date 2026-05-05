// utils/email.js
import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendOTP = async (email, otp) => {
    try {
        await transporter.sendMail({
            from: `"Bookstore" <${process.env.EMAIL_USER}>`,
            to: email, // ← THÊM DÒNG NÀY (QUAN TRỌNG NHẤT)
            subject: 'Mã OTP xác thực',
            html: `
        <h3>Mã OTP của bạn: <strong style="font-size: 1.5em;">${otp}</strong></h3>
        <p>Hết hạn sau <strong>5 phút</strong>.</p>
        <p>Không chia sẻ mã này với bất kỳ ai!</p>
      `
        });
        console.log(`OTP sent to ${email}`);
    } catch (err) {
        console.error('Lỗi gửi email:', err);
        throw err;
    }
};

export const sendOrderConfirmation = async ({ to, name, orderId, totalPrice, items }) => {
    if (!to) return;

    const formatCurrency = (value) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    const itemsList = (items || [])
        .map(
            (item) =>
                `<li>${item.title || 'Sản phẩm'} x${item.quantity || 1} — ${formatCurrency(
                    item.price || 0
                )}</li>`
        )
        .join('');

    try {
        await transporter.sendMail({
            from: `"Bookstore" <${process.env.EMAIL_USER}>`,
            to,
            subject: `Xác nhận đơn hàng #${orderId}`,
            html: `
        <h2>Cảm ơn ${name || 'khách hàng'} đã đặt hàng!</h2>
        <p>Đơn hàng <strong>#${orderId}</strong> đã được ghi nhận và đang được xử lý.</p>
        <p><strong>Tổng thanh toán:</strong> ${formatCurrency(totalPrice || 0)}</p>
        <p><strong>Chi tiết:</strong></p>
        <ul>
          ${itemsList || '<li>(Không có sản phẩm)</li>'}
        </ul>
        <p>Chúng tôi sẽ thông báo khi đơn hàng chuyển sang trạng thái tiếp theo.</p>
      `
        });
        console.log(`Confirmation email sent to ${to} for order ${orderId}`);
    } catch (err) {
        console.error('Lỗi gửi mail xác nhận đơn hàng', err);
        throw err;
    }
};