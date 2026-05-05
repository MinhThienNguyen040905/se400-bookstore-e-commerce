import express from 'express';
const router = express.Router();
import bookController from '../controllers/bookController.js';
import { auth, adminAuth, optionalAuth } from '../middleware/auth.js';

router.post('/', auth, adminAuth, bookController.uploadCover, bookController.addBook);
router.get('/', bookController.getBooks);
router.get('/new-releases', bookController.getNewReleases);
router.get('/top-rated', bookController.getTopRatedBooks);
router.get('/all', auth, adminAuth, bookController.getAllBooksSystem);
router.get('/:id', optionalAuth, bookController.getBookById);
router.put('/:id', auth, adminAuth, bookController.uploadCover, bookController.updateBook);
router.delete('/:id', auth, adminAuth, bookController.deleteBook);

export default router;