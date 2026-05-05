import express from 'express';
const router = express.Router();
import userController from '../controllers/userController.js';
import { auth, adminAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

router.post('/login', asyncHandler(userController.login));
router.post('/refresh-token', asyncHandler(userController.refreshToken));
router.post('/logout', auth, asyncHandler(userController.signOut));
router.get('/', auth, adminAuth, asyncHandler(userController.getUsers));

router.post('/request-otp', asyncHandler(userController.requestOTP));
router.post('/verify-otp', asyncHandler(userController.verifyOTP));
router.post('/register', asyncHandler(userController.completeRegister));
router.post('/reset-password', asyncHandler(userController.resetPassword));

router.put('/profile', auth, userController.uploadAvatar, asyncHandler(userController.updateProfile));

// === Route Đổi Mật Khẩu ===
// Yêu cầu phải đăng nhập (auth)
router.put('/change-password', auth, asyncHandler(userController.changePassword));

router.delete('/delete', auth, asyncHandler(userController.deleteUser));

export default router;
