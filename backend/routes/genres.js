// routes/genres.js
import express from 'express';
const router = express.Router();
import genreController from '../controllers/genreController.js';
import { auth, adminAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

// Public
router.get('/', genreController.getGenres);

// Protected: Admin only
router.post('/', auth, adminAuth, asyncHandler(genreController.addGenre));
router.put('/:id', auth, adminAuth, genreController.updateGenre);
router.delete('/:id', auth, adminAuth, genreController.deleteGenre);

export default router;
