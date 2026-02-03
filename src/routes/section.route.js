import express from "express";
import { authenticateToken, checkIsTeacher } from "../middlewares/authMiddleware.js";
import { getSectionById, createSection, deleteSection, getSectionsOfCourse, updateSection } from "../controllers/section.controller.js";
const router = express.Router();

router.get('/get-sections-of-course', authenticateToken, getSectionsOfCourse)

router.post('/create-section', authenticateToken, checkIsTeacher, createSection);

router.put('/update-section/:id', authenticateToken, checkIsTeacher, updateSection);

router.delete('/delete-section/:id', authenticateToken, checkIsTeacher, deleteSection);

router.get('/get-section/:sectionId', getSectionById);

export default router;