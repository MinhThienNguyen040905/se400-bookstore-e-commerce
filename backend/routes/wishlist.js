// routes/wishlist.js
import express from 'express';
import wishlistController from '../controllers/wishlistController.js';
import { auth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// POST /api/wishlist/toggle - Toggle a book in/out of wishlist
router.post('/toggle', auth, asyncHandler(wishlistController.toggleWishlist));

// GET /api/wishlist - Get user's wishlist
router.get('/', auth, asyncHandler(wishlistController.getWishlist));

export default router;
