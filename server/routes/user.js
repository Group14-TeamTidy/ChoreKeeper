const express = require("express");
// MIDDLEWARE
const { verifyToken } = require("../middleware/auth.js");
// CONTROLLER FUNCTIONS
const { getUser, setNotifs } = require("../controller/user.js");

const router = express.Router();

//ROUTES
router.get("/email", verifyToken, getUser); // Get the user's email
router.put("/notifs", verifyToken, setNotifs); // Set the user's notification settings

module.exports = router;
