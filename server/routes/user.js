import express from "express";
import { body } from "express-validator";

import { getUser } from "../controller/user.js";

const router = express.Router();

//ROUTES
router.get("/:email", getUser);

export default router;
