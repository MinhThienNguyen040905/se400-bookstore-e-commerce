// routes/authors.js
import express from 'express';
const router = express.Router();
import authorController from '../controllers/authorController.js';
import { auth, adminAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

// Public: Lấy danh sách (cho filter, search)
router.get('/', asyncHandler(authorController.getAuthors));

// Protected: Chỉ Admin mới được thao tác dữ liệu
router.post('/', auth, adminAuth, asyncHandler(authorController.addAuthor));
router.put('/:id', auth, adminAuth, asyncHandler(authorController.updateAuthor));
router.delete('/:id', auth, adminAuth, asyncHandler(authorController.deleteAuthor));

export default router;
