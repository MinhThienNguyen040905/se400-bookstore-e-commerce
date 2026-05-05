import express from 'express';
const router = express.Router();
import bookController from '../controllers/bookController.js';
import { auth, adminAuth, optionalAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

router.post('/', auth, adminAuth, bookController.uploadCover, asyncHandler(bookController.addBook));
router.get('/', asyncHandler(bookController.getBooks));
router.get('/new-releases', asyncHandler(bookController.getNewReleases));
router.get('/top-rated', asyncHandler(bookController.getTopRatedBooks));
router.get('/all', auth, adminAuth, asyncHandler(bookController.getAllBooksSystem));
router.get('/:id', optionalAuth, asyncHandler(bookController.getBookById));
router.put('/:id', auth, adminAuth, bookController.uploadCover, asyncHandler(bookController.updateBook));
router.delete('/:id', auth, adminAuth, asyncHandler(bookController.deleteBook));

export default router;
