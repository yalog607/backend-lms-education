import express from "express";
import { authenticateToken, checkIsTeacher } from "../middlewares/authMiddleware.js";
import { createNotification, deleteNotification, getNotificationOfUser, readNotification } from "../controllers/notification.controller.js";
const router = express.Router();

router.post('/create-notification', authenticateToken, checkIsTeacher, createNotification)
router.post('/read-notification', authenticateToken, readNotification);

router.delete('/delete-notification/:notificationId', authenticateToken, checkIsTeacher, deleteNotification)

router.get('/get-notification', authenticateToken, getNotificationOfUser);

export default router;