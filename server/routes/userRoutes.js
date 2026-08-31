import express from "express";
import { getDashboard } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard", protect, getDashboard);

export default router;
