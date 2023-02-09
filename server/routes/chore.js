import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { getAllChores } from "../controller/chore.js";
import { body } from "express-validator";

const router = express.Router();

router.get("/chores", verifyToken, getAllChores);

export default router;
