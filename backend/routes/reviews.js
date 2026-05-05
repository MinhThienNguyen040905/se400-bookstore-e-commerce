import express from 'express';
const router = express.Router();
import reviewController from '../controllers/reviewController.js';
import { auth, adminAuth } from '../middleware/auth.js';

router.post('/', auth, reviewController.addReview);
router.get('/book/:book_id', reviewController.getReviewsByBook);
router.get('/all', auth, adminAuth, reviewController.getAllReviews);

export default router;