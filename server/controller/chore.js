import { validationResult } from "express-validator";
// MODELS
import Chore from "../models/Chore.js";
import User from "../models/User.js";
import { repeatInMs } from "../services/utils.js";

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
    const { name, frequency, location, duration, preference } = req.body; // Extracting fields recieved from request

    // Check if this chore already exists
    const existingChore = await Chore.findOne({
      name: name,
      frequency: {
        quantity: frequency.quantity,
        interval: frequency.interval,
      },
      location: location,
      duration: duration,
      preference: preference,
    });

    if (existingChore) {
      return res.status(409).json({
        message: `Chore: ${name} already exists. If you want to change somthing, please use the EDIT option.`,
      });
    }

    const lastCheckedOff = []; // This array will contain all time stamps when the chore was last checked off by the user

    const repeatMs = repeatInMs(frequency.quantity, frequency.interval); // Converting the frequency to milliseconds
    const nextOccurrence = Date.now() + repeatMs; // All time to be stored in milliseconds

    // Creating a new chore to add to database
    const newChore = new Chore({
      name,
      frequency,
      location,
      duration,
      preference,
      lastCheckedOff,
      nextOccurrence,
    });

    // Save to database
    const savedChore = await newChore.save();

    // Get the user that is creating the chore
    const userID = req.user.id;
    const user = await User.findOne({ _id: userID }); // Search for the user

    // Add the new chore to the list of chores that the user has created
    user.chores.push(savedChore._id);
    await user.save();

    return res.status(201).json({ Chore: savedChore });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Chore could not be created" });
  }
}; // createChore

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
    const chores = await Chore.find({ _id: { $in: user.chores } });

    // Format the chore list for the response
    const formattedChores = chores.map(
      ({
        _id,
        name,
        frequency,
        location,
        duration,
        preference,
        lastCheckedOff,
        nextOccurrence,
      }) => ({
        _id,
        name,
        frequency,
        location,
        duration,
        preference,
        lastCheckedOff,
        nextOccurrence,
      })
    );

    // Return the chore list in the response
    res.status(200).json(formattedChores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}; // getAllChores

/*

 ** This function retrives a single chores for a user
 ** @param {Object} req - The request object
 ** @param {Object} res - The response object
 */
export const getSingleChore = async (req, res) => {
  const choreId = req.params.id;
  try {
    // Retrieve the chore from the database
    const chore = await Chore.findOne({ _id: choreId });
    if (!chore) {
      return res.status(404).json({ message: "Chore not found" });
    }
    // Return the chore in the response
    return res.status(200).json(chore);
  } catch (error) {
    console.error(error);
    // Return an error message in the response in case of any unexpected errors
    return res.status(500).json({ message: "Internal Server Error" });
  }
}; // getSingleChore

/*
 ** This function edits the details of an existing chore
 ** @param {Object} req - The request object
 ** @param {Object} res - The response object
 */
export const editChore = async (req, res) => {
  try {
    const { name, frequency, location, duration, preference } = req.body; //extracting fields recieved from request
    const chore = await Chore.findOne({ _id: req.params.id });

    if (chore === null) {
      return res
        .status(404)
        .json({ message: `Chore with id ${req.params.id} was not found` });
    }

    if (
      chore.frequency.interval != frequency.interval ||
      chore.frequency.quantity != frequency.quantity
    ) {
      const repeatMs = repeatInMs(frequency.quantity, frequency.interval); // Get time in ms from req.frequency

      // Get the last checked off time (last item in lastCheckedOff Array)
      // If it is empty, use the date it was created at
      let referenceTime;
      const lastCheckArray = chore.lastCheckedOff;
      if (lastCheckArray.length === 0) {
        const choreCreationTimestam = chore._id.getTimestamp();
        const choreCreationDate = new Date(choreCreationTimestam);
        referenceTime = choreCreationDate.getTime(); // in ms
      } else {
        referenceTime = lastCheckArray[lastCheckArray.length - 1];
      }

      // Calculate the new nextOccurrence
      chore.nextOccurrence = referenceTime + repeatMs;
    }

    // Update the remaining chore fields
    chore.name = name;
    chore.frequency.quantity = frequency.quantity;
    chore.frequency.interval = frequency.interval;
    chore.location = location;
    chore.duration = duration;
    chore.preference = preference;

    await chore.save();
    return res.status(201).json(chore);
  } catch (error) {
    console.error(error);
    // Return an error message in the response in case of any unexpected errors
    res.status(500).json({ message: "Internal Server Error" });
  }
}; // editChore

/*
 ** This function deletes a chore from the chore database as well as user chore list
 ** @param {Object} req - The request object
 ** @param {Object} res - The response object
 */
export const deleteChore = async (req, res) => {
  try {
    const choreId = req.params.id;
    // Delete chore from chores database
    await Chore.findByIdAndDelete({ _id: choreId });

    // Get the user that is deleting the chore
    const userID = req.user.id;
    const user = await User.findOne({ _id: userID }); // search for the user

    // Get the list of chores for the user
    let userChores = [...user.chores];

    // Remove chore id from the users chore array
    const idIndex = userChores.findIndex(
      (val) => choreId == val._id.toString()
    );

    if (idIndex > -1) {
      // Only splice array when id is found
      userChores.splice(idIndex, 1);

      // Assigning the updated array to user.chores
      user.chores = [...userChores];
      await user.save();
      return res
        .status(200)
        .json({ message: `Chore with id ${choreId} deleted successfully!` });
    } else {
      // Chore ID not found in user's chore list
      return res.status(404).json({
        message: "Could not delete the given chore as chore was not found.",
      });
    }
  } catch (error) {
    console.error(error);
    // Return an error message in the response in case of any unexpected errors
    res.status(500).json({ message: "Internal Server Error" });
  }
}; // deleteChore

/*
 ** This function checks off a chore by updating its nextOccurrence and checkedOff params
 ** @param {Object} req - The request object
 ** @param {Object} res - The response object
 */
export const checkOffChore = async (req, res) => {
  try {
    const id = req.params.id;

    const chore = await Chore.findById({ _id: id });

    if (chore === null) {
      return res
        .status(404)
        .json({ message: `Chore with id ${id} was not found.` });
    }

    const checkOffTime = Date.now();
    // Adding the check off time in the array of chores last checked off list
    chore.lastCheckedOff.push(checkOffTime);

    const repeatMs = repeatInMs(
      chore.frequency.quantity,
      chore.frequency.interval
    );
    const nextOccurrence = checkOffTime + repeatMs; // All time to be stored in milliseconds
    chore.nextOccurrence = nextOccurrence;
    await chore.save();

    return res.status(201).json({ message: `Chore checked off successfully!` });
  } catch (error) {
    console.error(error);
    // Return an error message in the response in case of any unexpected errors
    res.status(500).json({ message: "Internal Server Error" });
  }
}; // checkOffChore
