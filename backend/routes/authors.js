// routes/authors.js
import express from 'express';
const router = express.Router();
import authorController from '../controllers/authorController.js';
import { auth, adminAuth } from '../middleware/auth.js';

// Public: Lấy danh sách (cho filter, search)
router.get('/', authorController.getAuthors);

// Protected: Chỉ Admin mới được thao tác dữ liệu
router.post('/', auth, adminAuth, authorController.addAuthor);
router.put('/:id', auth, adminAuth, authorController.updateAuthor);
router.delete('/:id', auth, adminAuth, authorController.deleteAuthor);

export default router;