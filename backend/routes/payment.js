// routes/payment.js
import express from 'express';
const router = express.Router();
import paymentController from '../controllers/paymentController.js';
import { auth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

router.post('/create_payment_url', auth, asyncHandler(paymentController.createPaymentUrl));
router.get('/vnpay_return', asyncHandler(paymentController.vnpayReturn));

export default router;
