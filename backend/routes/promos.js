import express from 'express';
const router = express.Router();
import promoController from '../controllers/promoController.js';
import { auth, adminAuth } from '../middleware/auth.js';

router.post('/', auth, adminAuth, promoController.addPromo);
router.get('/', promoController.getPromos);
router.post('/by-code', promoController.getPromoByCode);
router.get('/all', auth, adminAuth, promoController.getAllPromos);

export default router;