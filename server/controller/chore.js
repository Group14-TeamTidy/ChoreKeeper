import { check, validationResult } from "express-validator";

// MODELS
import Chore from "../models/Chore.js";

/*
 ** This function creates new chore
 ** @param {Object} req - The request object
 ** @param {Object} res - The response object
 */
 export const createChore = async (req, res) => {
    // Sanitize data
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

    try {
        const { name, frequency, location, duration, preference } = req.body;
        console.log(name);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Chore could not be created" });
    }



 } //createChore