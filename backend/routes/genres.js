// routes/genres.js
import express from 'express';
const router = express.Router();
import genreController from '../controllers/genreController.js';
import { auth, adminAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

// Public
router.get('/', asyncHandler(genreController.getGenres));

// Protected: Admin only
router.post('/', auth, adminAuth, asyncHandler(genreController.addGenre));
router.put('/:id', auth, adminAuth, asyncHandler(genreController.updateGenre));
router.delete('/:id', auth, adminAuth, asyncHandler(genreController.deleteGenre));

export default router;
