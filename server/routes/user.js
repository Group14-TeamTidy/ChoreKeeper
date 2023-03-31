import express from "express";

// MIDDLEWARE
import { verifyToken } from "../middleware/auth.js";

// CONTROLLER FUNCTIONS
import { getUser } from "../controller/user.js";
import { setNotifs } from "../controller/user.js";

const router = express.Router();

//ROUTES
router.get("/email", verifyToken, getUser); // Get the user's email
router.put("/notifs", verifyToken, setNotifs); // Set the user's notification settings

export default router;
