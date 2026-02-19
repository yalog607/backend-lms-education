import express from "express";
const router = express.Router();
import { signMuxToken } from "../controllers/mux.controller.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

router.post("/sign", authenticateToken, signMuxToken);

export default router;