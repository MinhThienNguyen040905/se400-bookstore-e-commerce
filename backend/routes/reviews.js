import express from 'express';
const router = express.Router();
import reviewController from '../controllers/reviewController.js';
import { auth, adminAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

router.post('/', auth, asyncHandler(reviewController.addReview));
router.get('/book/:book_id', asyncHandler(reviewController.getReviewsByBook));
router.get('/all', auth, adminAuth, asyncHandler(reviewController.getAllReviews));

export default router;
