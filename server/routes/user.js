import express from "express";
import { body } from "express-validator";
// MIDDLEWARE
import { verifyToken } from "../middleware/auth.js";
// CONTROLLER FUNCTIONS
import { getUser } from "../controller/user.js";

const router = express.Router();

//ROUTES
router.get("/email", verifyToken, getUser);

export default router;
