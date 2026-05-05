import express from 'express';
const router = express.Router();
import cartController from '../controllers/cartController.js';
import { auth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

router.post('/', auth, asyncHandler(cartController.addToCart));
router.put('/', auth, asyncHandler(cartController.updateCart));
router.delete('/:book_id', auth, asyncHandler(cartController.removeFromCart));
router.get('/', auth, asyncHandler(cartController.getCart));

export default router;
