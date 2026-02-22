import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { updateProgress, deleteProgress, getProgress, getCourseProgress } from "../controllers/progress.controller.js";
const router = express.Router();

router.post('/update', authenticateToken, updateProgress)
router.get('/get-progress/:lesson_id', authenticateToken, getProgress);
router.post('/course-progress', authenticateToken, getCourseProgress);
router.delete('/delete-progress/:id', authenticateToken, deleteProgress)

export default router;