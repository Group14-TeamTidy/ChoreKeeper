import express from "express";
import { body } from "express-validator";
// CONTROLLER FUNCTIONS
import { createSchedule } from "../controller/schedule.js";
// MIDDLEWARE
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

//ROUTES

router.get("/", verifyToken, createSchedule); //get the daily schedule for the user

export default router;
