import express from 'express';
const router = express.Router();
import orderController from '../controllers/orderController.js';
import { auth, adminAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

router.post('/', auth, asyncHandler(orderController.createOrder));
router.get('/my-orders', auth, asyncHandler(orderController.getMyOrders));
router.get('/', auth, asyncHandler(orderController.getOrders));
router.get('/all', auth, adminAuth, asyncHandler(orderController.getAllOrders));
router.put('/order-status', auth, adminAuth, asyncHandler(orderController.updateOrderStatus));
router.put('/cancel', auth, asyncHandler(orderController.cancelOrder));
router.get('/:id', auth, asyncHandler(orderController.getOrderById));

export default router;
