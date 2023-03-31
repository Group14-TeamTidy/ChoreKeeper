import express from "express";

// CONTROLLER FUNCTIONS
import { createSchedule } from "../controller/schedule.js";

// MIDDLEWARE
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

//ROUTES
router.get("/:timeframe", verifyToken, createSchedule); // Get the daily schedule for the user

export default router;
