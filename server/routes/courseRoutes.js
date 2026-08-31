import express from "express";
import { searchCourses, getCourseById, getReadinessEstimate } from "../controllers/courseController.js";

const router = express.Router();

router.post("/search", searchCourses);
router.post("/readiness", getReadinessEstimate);
router.get("/:id", getCourseById);

export default router;
