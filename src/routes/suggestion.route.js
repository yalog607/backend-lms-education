import express from "express";
import { authenticateToken, checkIsAdmin, checkIsTeacher } from "../middlewares/authMiddleware.js";
import { approveSuggestion, createSuggestion, getSuggestions, rejectSuggestion } from "../controllers/suggestion.controller.js";
const router = express.Router();

router.post('/create-suggestion', authenticateToken, checkIsTeacher, createSuggestion)

router.get('/get-suggestions', authenticateToken, checkIsAdmin, getSuggestions);

router.patch('/approve/:id', authenticateToken, checkIsAdmin, approveSuggestion)

router.delete('/reject/:id', authenticateToken, checkIsAdmin, rejectSuggestion)

export default router;