import express from "express";
import { body } from "express-validator";
// MIDDLEWARE
import { verifyToken } from "../middleware/auth.js";
// CONTROLLER FUNCTIONS
import { getUser } from "../controller/user.js";
import { setNotifs } from "../controller/user.js";

const router = express.Router();

//ROUTES
router.get("/email", verifyToken, getUser);
router.put("/notifs", verifyToken, setNotifs);

export default router;
