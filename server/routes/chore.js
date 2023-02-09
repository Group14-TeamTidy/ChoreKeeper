import express from "express";

import { createChore } from "../controller/chore.js";

const router = express.Router();

//ROUTES
router.get("/id", ); //get a single chore

router.post("/create", createChore); //create a chore

router.post("/id", ); //edit a chore

router.delete("/id", ); //delete a chore

export default router;