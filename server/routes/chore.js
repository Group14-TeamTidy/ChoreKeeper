import express from "express";
import { body } from "express-validator";
// CONTROLLER FUNCTIONS
import {
  createChore,
  getAllChores,
  // getSingleChore,
  editChore,
} from "../controller/chore.js";
// MIDDLEWARE
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

//ROUTES
// router.get("/id/:id", verifyToken, getSingleChore); //get a single chore

router.patch("/id/:id", verifyToken, editChore); //edit a chore

router.get("/", verifyToken, getAllChores); //get all chores for a user

router.post("/create", verifyToken, createChore); //create a chore

// router.delete("/id", ); //delete a chore

export default router;
