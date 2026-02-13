import express from "express";
import { authenticateToken, checkIsAdmin } from "../middlewares/authMiddleware.js";
import { createEnrollment, getEnrollments, getEnrollmentsOfUser } from "../controllers/enrollment.controller.js";
const router = express.Router();

router.get('/get-enrollments', authenticateToken, checkIsAdmin, getEnrollments)
router.get('/get-enrollments-of-user/', authenticateToken, getEnrollmentsOfUser);

router.post('/purchase-course', authenticateToken, createEnrollment);

export default router;