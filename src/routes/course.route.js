import express from 'express';
import { checkOwnCourse, getEnrolledCourses, getAllCourses, getLatestCourses, createCourse, getCourseById, getCoursesOfTeacher, updateCourse, deleteCourse, courseSearchAdvanced} from "../controllers/course.controller.js";
import { authenticateToken, checkIsAdmin, checkIsTeacher } from '../middlewares/authMiddleware.js';
import { uploadCloud } from "../lib/cloudinary.js";
const router = express.Router();

router.get("/get-latest-courses", getLatestCourses);
router.get("/get-all-courses", getAllCourses);
router.get("/get-course/:id", getCourseById)
router.get("/get-user-courses", authenticateToken, getEnrolledCourses)
router.get('/check-own-course/:course_id', authenticateToken, checkOwnCourse);

router.get("get-courses-of-teacher/:teacher_Id", authenticateToken, checkIsTeacher, getCoursesOfTeacher)

router.post('/create-course', authenticateToken, checkIsTeacher, uploadCloud.single('image'), createCourse);

router.put('/update-course/:courseId', authenticateToken, checkIsTeacher, uploadCloud.single('image'), updateCourse)

router.delete('/delete-course/:courseId', authenticateToken, checkIsAdmin, deleteCourse)

router.get('/search-course/:q', courseSearchAdvanced)

export default router;