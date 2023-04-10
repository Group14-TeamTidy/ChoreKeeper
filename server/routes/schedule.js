const express = require("express");
// CONTROLLER FUNCTIONS
const { createSchedule } = require("../controller/schedule.js");
// MIDDLEWARE
const { verifyToken } = require("../middleware/auth.js");

const router = express.Router();

//ROUTES
router.get("/", verifyToken, createSchedule); // Get the daily schedule for the user

module.exports = router;
