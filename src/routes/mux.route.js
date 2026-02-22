import express from "express";
const router = express.Router();
import { signMuxToken, getUploadUrl } from "../controllers/mux.controller.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

router.post("/sign", authenticateToken, signMuxToken);
router.get("/upload-url", authenticateToken, getUploadUrl);

export default router;