import express from 'express';
const router = express.Router();
import userController from '../controllers/userController.js';
import { auth, adminAuth } from '../middleware/auth.js';

router.post('/login', userController.login);
router.post('/refresh-token', userController.refreshToken);
router.post('/logout', auth, userController.signOut);
router.get('/', auth, adminAuth, userController.getUsers);

router.post('/request-otp', userController.requestOTP);
router.post('/verify-otp', userController.verifyOTP);
router.post('/register', userController.completeRegister);
router.post('/reset-password', userController.resetPassword);

router.put('/profile', auth, userController.uploadAvatar, userController.updateProfile);

// === Route Đổi Mật Khẩu ===
// Yêu cầu phải đăng nhập (auth)
router.put('/change-password', auth, userController.changePassword);

router.delete('/delete', auth, userController.deleteUser);

export default router;