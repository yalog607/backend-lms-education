import express from "express";
import { authenticateToken, checkIsTeacher } from "../middlewares/authMiddleware.js";
import { getLesson, createLesson, deleteLesson, getFreeLessons, getLessons, getRecentLessonOfTeacher, updateLesson } from "../controllers/lesson.controller.js";
const router = express.Router();

router.get('/get-free-lessons', getFreeLessons);
router.get('/get-lessons', getLessons);
router.get('get-lesson/:lessonId', authenticateToken, getLesson);
router.get('/get-recent-lessons-of-teacher', authenticateToken, checkIsTeacher, getRecentLessonOfTeacher);

router.post('/create-lesson', authenticateToken, checkIsTeacher, createLesson);

router.delete('/delete-lesson/:lessonId', authenticateToken, checkIsTeacher, deleteLesson);

router.put('/update-lesson/:lessonId', authenticateToken, checkIsTeacher, updateLesson);

export default router;