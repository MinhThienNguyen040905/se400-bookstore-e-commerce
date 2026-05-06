// controllers/paymentController.js
import paymentService from '../services/paymentService.js';
import paymentValidator from '../validators/paymentValidator.js';

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

const createPaymentUrl = async (req, res) => {
    const input = paymentValidator.createVnpayPayment(req.body);
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const result = await paymentService.createVnpayPayment({
        userId: req.user.user_id,
        address: input.address,
        phone: input.phone,
        promoCode: input.promoCode,
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
