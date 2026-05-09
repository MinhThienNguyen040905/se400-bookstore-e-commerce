import express from 'express';
import recommendationController from '../controllers/recommendationController.js';
import { optionalAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/personalized', optionalAuth, asyncHandler(recommendationController.getPersonalized));
router.get('/trending', asyncHandler(recommendationController.getTrending));
router.get('/books/:id/similar', asyncHandler(recommendationController.getSimilarBooks));

export default router;
