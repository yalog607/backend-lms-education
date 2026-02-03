import express from 'express'
import { getNumberStudentsInCourse, getNumberAllStudents } from '../controllers/student.controller.js';
import { authenticateToken, checkIsAdmin, checkIsTeacher } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.get('/get-number-students-in-course/:courseId', getNumberStudentsInCourse);
router.get('/get-number-all-students', authenticateToken, checkIsAdmin, getNumberAllStudents)

export default router;