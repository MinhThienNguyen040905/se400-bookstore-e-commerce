// routes/publishers.js
import express from 'express';
const router = express.Router();
import publisherController from '../controllers/publisherController.js';
import { auth, adminAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

// Public: Xem danh sách
router.get('/', asyncHandler(publisherController.getPublishers));

// Protected: Admin only
router.post('/', auth, adminAuth, asyncHandler(publisherController.addPublisher));
router.put('/:id', auth, adminAuth, asyncHandler(publisherController.updatePublisher));
router.delete('/:id', auth, adminAuth, asyncHandler(publisherController.deletePublisher));

export default router;
