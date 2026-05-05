import express from 'express';
const router = express.Router();
import cartController from '../controllers/cartController.js';
import { auth } from '../middleware/auth.js';

router.post('/', auth, cartController.addToCart);
router.put('/', auth, cartController.updateCart);
router.delete('/:book_id', auth, cartController.removeFromCart);
router.get('/', auth, cartController.getCart);

export default router;