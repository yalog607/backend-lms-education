import express from "express";
import { handleMuxWebhook } from "../controllers/webhook.controller.js";

const router = express.Router();

router.post("/mux", handleMuxWebhook);

export default router;