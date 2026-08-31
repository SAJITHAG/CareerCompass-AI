import express from "express";
import { updateProfile, toggleRoadmapSkill } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, updateProfile);
router.post("/skills/toggle", protect, toggleRoadmapSkill);

export default router;
