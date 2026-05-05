// controllers/paymentController.js
import paymentService from '../services/paymentService.js';

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

const createPaymentUrl = async (req, res) => {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const result = await paymentService.createVnpayPayment({
        userId: req.user.user_id,
        address: req.body.address,
        phone: req.body.phone,
        promoCode: req.body.promo_code,
        ipAddress
    });

    res.success(result, 'Da tao link thanh toan VNPay');
};

const vnpayReturn = async (req, res) => {
    const result = await paymentService.handleVnpayReturn({
        query: req.query,
        clientUrl
    });

    return res.redirect(result.redirectUrl);
};

export default { createPaymentUrl, vnpayReturn };
