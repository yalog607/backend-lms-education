import express from "express";
import { getAllTeachers, getCourseById } from "../controllers/teacher.controller.js";
import { authenticateToken, checkIsAdmin } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/get-all-teachers", authenticateToken, checkIsAdmin, getAllTeachers);
router.get('/get-course/:id', getCourseById);

export default router;