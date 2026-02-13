import {getMe, getAllUser, login, register, refreshToken, logout, updateUser, updateAvatarUser, changePassword} from '../controllers/auth.controller.js';
import express from 'express';
import { authenticateToken, checkIsAdmin } from '../middlewares/authMiddleware.js';
import { uploadCloud } from "../lib/cloudinary.js"

const router = express.Router();

router.get('/get-all-users', authenticateToken, checkIsAdmin, getAllUser);

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/change-password', authenticateToken, changePassword);

router.put('/update-user', authenticateToken, updateUser);
router.post('/update-avatar-user', authenticateToken, uploadCloud.single('image'), updateAvatarUser);

router.get("/me", authenticateToken, getMe);

export default router;