import express from "express";
import { sayHello } from "../controller/hello.js";

const router = express.Router();

router.get("/", sayHello);

export default router;
