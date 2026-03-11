import express from 'express';
import { getEnrolledCourseIds, checkOwnCourse, getEnrolledCourses, getAllCourses, getLatestCourses, createCourse, getCourseById, getCoursesOfTeacher, updateCourse, deleteCourse, courseSearchAdvanced} from "../controllers/course.controller.js";
import { authenticateToken, checkIsTeacher } from '../middlewares/authMiddleware.js';
import { uploadCloud } from "../lib/cloudinary.js";
const router = express.Router();

router.get("/get-latest-courses", getLatestCourses);
router.get("/get-all-courses", getAllCourses);
router.get("/get-course/:id", getCourseById)
router.get("/get-user-courses", authenticateToken, getEnrolledCourses)
router.get('/check-own-course/:course_id', authenticateToken, checkOwnCourse);
router.get('/get-enrolled-course-ids', authenticateToken, getEnrolledCourseIds)

router.get('/get-courses-of-teacher/:teacher_id', authenticateToken, checkIsTeacher, getCoursesOfTeacher)

router.post('/create-course', authenticateToken, checkIsTeacher, uploadCloud.single('image'), createCourse);

router.put('/update-course/:courseId', authenticateToken, checkIsTeacher, uploadCloud.single('image'), updateCourse)

router.delete('/delete-course/:courseId', authenticateToken, checkIsTeacher, deleteCourse)

router.get('/search-course/:q', courseSearchAdvanced)

export default router;