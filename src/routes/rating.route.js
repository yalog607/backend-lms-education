import express from "express";
import { authenticateToken, checkIsAdmin } from "../middlewares/authMiddleware.js";
import { createRating, deleteRating, getRatings } from "../controllers/rating.controller.js";
const router = express.Router();

router.post('/create-rating', authenticateToken, createRating);
router.post('/get-ratings/:course_id', getRatings)

router.delete('/delete-rating/:id', authenticateToken, checkIsAdmin, deleteRating);

export default router;