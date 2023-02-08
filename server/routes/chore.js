import express from "express";

import { getUser } from "../controller/user.js";

const router = express.Router();

//ROUTES
router.get("/chores/id", ); //get a single chore

router.post("/chores", ); //create a chore

router.post("/chores/id", ); //edit a chore

router.delete("/chores/id", ); //delete a chore

export default router;
