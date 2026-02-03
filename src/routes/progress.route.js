import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { updateProgress, deleteProgress, getProgress } from "../controllers/progress.controller.js";
const router = express.Router();

router.post('/create-progress', authenticateToken, updateProgress)
router.get('/get-progress/:lesson_id', authenticateToken, getProgress);
router.delete('/delete-progress/:id', authenticateToken, deleteProgress)

export default router;