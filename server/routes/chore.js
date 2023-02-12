import express from "express";
import { body } from "express-validator";
// MIDDLEWARE
import { verifyToken } from "../middleware/auth.js";
// CONTROLLER FUNCTIONS
import { createChore, getAllChores } from "../controller/chore.js";

const router = express.Router();

//ROUTES
// router.get("/id", ); //get a single chore

router.get("/", verifyToken, getAllChores); //get all chores for a user

router.post("/create", verifyToken, createChore); //create a chore


// router.post("/id", ); //edit a chore

// router.delete("/id", ); //delete a chore

export default router;
