import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { body } from "express-validator";
import {
  createChore,
  getAllChores,
  getSingleChore,
} from "../controller/chore.js";

const router = express.Router();

//ROUTES
router.get("/id/:id", verifyToken, getSingleChore); //get a single chore

router.get("/", verifyToken, getAllChores); //get all chores for a user

router.post("/create", createChore); //create a chore

// router.post("/id", ); //edit a chore

// router.delete("/id", ); //delete a chore

export default router;
