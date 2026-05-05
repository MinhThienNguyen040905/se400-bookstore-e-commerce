// routes/publishers.js
import express from 'express';
const router = express.Router();
import publisherController from '../controllers/publisherController.js';
import { auth, adminAuth } from '../middleware/auth.js';

// Public: Xem danh sách
router.get('/', publisherController.getPublishers);

// Protected: Admin only
router.post('/', auth, adminAuth, publisherController.addPublisher);
router.put('/:id', auth, adminAuth, publisherController.updatePublisher);
router.delete('/:id', auth, adminAuth, publisherController.deletePublisher);

export default router;