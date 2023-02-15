import express from "express";
import { body } from "express-validator";
// CONTROLLER FUNCTIONS
import {
  createChore,
  getAllChores,
  editChore,
  getSingleChore,
  deleteChore,
} from "../controller/chore.js";
// MIDDLEWARE
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

//ROUTES

router.get("/", verifyToken, getAllChores); //get all chores for a user
router.get("/:id", verifyToken, getSingleChore); //get a single chore
router.put("/:id", verifyToken, editChore); //edit a chore
router.post("/", verifyToken, createChore); //create a chore
router.delete("/:id", verifyToken, deleteChore); //delete a chore

// router.delete("/id", ); //delete a chore

export default router;
