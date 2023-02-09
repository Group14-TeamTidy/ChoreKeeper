
import { check, validationResult } from "express-validator";

// MODELS
import Chore from "../models/Chore.js";
import User from "../models/User.js";




/*
 ** This function creates new chore
 ** @param {Object} req - The request object
 ** @param {Object} res - The response object
 */
 export const createChore = async (req, res) => {
    // Sanitize data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

    try {
        const { name, frequency, location, duration, preference } = req.body; //extracting fields recieved from request
        // console.log(req.body);
        console.log(`Task Name: ${name},\nFrequency Quantity & Interval: ${frequency.quantity} times every ${frequency.interval},\nLocation: ${location},\nDuration (s): ${duration},\nPreference: ${preference}`);

        // check if this chore already exists
        const existingChore = await Chore.findOne({ name });
        if (existingChore) {
            return res.status(409).json({ message: `Chore: ${name} already exists. If you want to change somthing, please use the EDIT option.` });
        }

        // creating a new chore to add to database
        const newChore = new Chore({name, frequency, location, duration, preference});

        // Save to database
        const savedChore = await newChore.save();

        return res.status(201).json({ Chore: savedChore });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Chore could not be created" });
    }



 } //createChore
 
 /*
 ** This function retrives all the active chores for a user
 ** @param {Object} req - The request object
 ** @param {Object} res - The response object
 */
export const getAllChores = async (req, res) => {
  try {
    // Validate the request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get the user ID from the request
    const userID = req.user.id;

    // Find the user in the database
    const user = await User.findOne({ _id: userID });

    // Get the list of chores for the user
    const chores = await Promise.all(
      user.choreList.map((id) => Chore.findById(id))
    );

    // Format the chore list for the response
    const formattedChores = chores.map(
      ({ _id, name, frequency, location, duration, preference }) => ({
        _id,
        name,
        frequency,
        location,
        duration,
        preference,
      })
    );

    // Return the chore list in the response
    res.status(200).json(formattedChores);
  } catch (error) {
    console.error(error);
    // Return an error message in the response in case of any unexpected errors
    res.status(500).json({ message: "Internal Server Error" });
  }
}; //getAllChores
