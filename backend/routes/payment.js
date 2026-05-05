// routes/payment.js
import express from 'express';
const router = express.Router();
import paymentController from '../controllers/paymentController.js';
import { auth } from '../middleware/auth.js';

// Tạo URL thanh toán VNPay (yêu cầu authentication)
router.post('/create_payment_url', auth, paymentController.createPaymentUrl);

// Callback từ VNPay (không cần auth vì VNPay gọi trực tiếp)
router.get('/vnpay_return', paymentController.vnpayReturn);

export default router;

