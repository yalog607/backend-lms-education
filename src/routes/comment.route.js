import express from "express";
import { authenticateToken, checkIsAdmin } from "../middlewares/authMiddleware.js";
import { createComment, deleteComment, getComments } from "../controllers/comment.controller.js";
const router = express.Router();

router.get('/get-comments/:lessonId', authenticateToken, getComments);
router.post('/create-comment', authenticateToken, createComment);
router.delete('/delete-comment/:commentId', authenticateToken, checkIsAdmin, deleteComment)

export default router;