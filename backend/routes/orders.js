import express from 'express';
const router = express.Router();
import orderController from '../controllers/orderController.js';
import { auth, adminAuth } from '../middleware/auth.js';

router.post('/', auth, orderController.createOrder);
router.get('/my-orders', auth, orderController.getMyOrders);
router.get('/', auth, orderController.getOrders);
router.get('/all', auth, adminAuth, orderController.getAllOrders);
router.put('/order-status', auth, adminAuth, orderController.updateOrderStatus);
router.put('/cancel', auth, orderController.cancelOrder);
router.get('/:id', auth, orderController.getOrderById);

export default router;