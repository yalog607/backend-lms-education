import express from 'express';
import { getAllCourses, getLatestCourses, createCourse, getCourseById, getCoursesOfTeacher, updateCourse, deleteCourse} from "../controllers/course.controller.js";
import { authenticateToken, checkIsAdmin, checkIsTeacher } from '../middlewares/authMiddleware.js';
import { uploadCloud } from "../lib/cloudinary.js";
const router = express.Router();

router.get("/get-latest-courses", getLatestCourses);
router.get("/get-all-courses", getAllCourses);
router.get("/get-course/:id", getCourseById)

router.get("get-courses-of-teacher/:teacher_Id", authenticateToken, checkIsTeacher, getCoursesOfTeacher)

router.post('/create-course', authenticateToken, checkIsTeacher, uploadCloud.single('image'), createCourse);

router.put('/update-course/:courseId', authenticateToken, checkIsTeacher, uploadCloud.single('image'), updateCourse)

router.delete('/delete-course/:courseId', authenticateToken, checkIsAdmin, deleteCourse)

export default router;