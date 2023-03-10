import express from "express";
import { body } from "express-validator";
// CONTROLLER FUNCTIONS
import { createDailySchedule } from "../controller/dailySchedule.js";
// MIDDLEWARE
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

//ROUTES

router.get("/", verifyToken, createDailySchedule); //get the daily schedule for the user

export default router;