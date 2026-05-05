// routes/wishlist.js
import express from 'express';
import wishlistController from '../controllers/wishlistController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/wishlist/toggle - Toggle a book in/out of wishlist
router.post('/toggle', auth, wishlistController.toggleWishlist);

// GET /api/wishlist - Get user's wishlist
router.get('/', auth, wishlistController.getWishlist);

export default router;
