import express from 'express';
const router = express.Router();
import promoController from '../controllers/promoController.js';
import { auth, adminAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

router.post('/', auth, adminAuth, asyncHandler(promoController.addPromo));
router.get('/', asyncHandler(promoController.getPromos));
router.post('/by-code', asyncHandler(promoController.getPromoByCode));
router.get('/all', auth, adminAuth, asyncHandler(promoController.getAllPromos));

export default router;
