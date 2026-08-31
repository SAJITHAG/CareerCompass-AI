import express from "express";
import { analyzeCareer, analyzeCustomCareer, getAllCareers, getCareerById } from "../controllers/careerController.js";

const router = express.Router();

router.post("/analyze", analyzeCareer);
router.post("/custom", analyzeCustomCareer);
router.get("/", getAllCareers);
router.get("/:id", getCareerById);

export default router;
