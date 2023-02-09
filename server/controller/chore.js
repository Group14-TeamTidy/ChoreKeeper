import User from "../models/User.js";
import Chore from "../models/Chore.js";
import { validationResult } from "express-validator";

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
};
