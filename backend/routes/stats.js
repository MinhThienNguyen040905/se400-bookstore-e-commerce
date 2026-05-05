import express from 'express';
const router = express.Router();
import statsController from '../controllers/statsController.js';
import { auth, adminAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/admin/stats - Chỉ admin
router.get('/', auth, adminAuth, asyncHandler(statsController.getStats));

export default router;






