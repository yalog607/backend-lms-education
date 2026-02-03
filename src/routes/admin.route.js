import express from "express";
import { deleteUser } from '../controllers/auth.controller.js'
import { authenticateToken, checkIsAdmin } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.delete('/delete-user', authenticateToken, checkIsAdmin, deleteUser);

export default router;