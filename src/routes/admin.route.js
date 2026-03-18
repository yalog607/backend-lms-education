import express from "express";
import { deleteUser } from '../controllers/auth.controller.js'
import { authenticateToken, checkIsAdmin } from "../middlewares/authMiddleware.js";
import { upgradeToInstructor } from "../controllers/admin.controller.js";
const router = express.Router();

router.delete('/delete-user', authenticateToken, checkIsAdmin, deleteUser);
router.put('/upgrade-to-instructor', authenticateToken, checkIsAdmin, upgradeToInstructor)

export default router;