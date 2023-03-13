import { check, validationResult } from "express-validator";
// MODELS
import Chore from "../models/Chore.js";
import User from "../models/User.js";

/*
 ** This function returns the interval a chore is to be repeated in ms
 ** @param Number quantity - frequncy.quantity of a chore
 ** @param String interval - frequncy.interval of a chore
 */
function repeatInMs(quantity, interval) {
  // mapping interval into days
  var intervalToDays;
  if (interval == "days") {
    intervalToDays = 1;
  } else if (interval == "weeks") {
    intervalToDays = 7;
  } else if (interval == "months") {
    intervalToDays = 30; // just defaulting to 30
  } else {
    intervalToDays = 365; // interval is in years
  }

  // calculating how many days this chore is to be repeated
  const repeatInDays = quantity * intervalToDays;
  const msInDay = 24 * 60 * 60 * 1000; // number of milliseconds in a day
  return repeatInDays * msInDay;
} // repeatInDays

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

    console.log(
      `Task Name: ${name},\nFrequency Quantity & Interval: Every ${frequency.quantity} ${frequency.interval},\nLocation: ${location},\nDuration (s): ${duration},\nPreference: ${preference}`
    );

    // check if this chore already exists
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

    const lastCheckedOff = []; // this array will contain all time stamps when the chore was last checked off by the user

    const repeatMs = repeatInMs(frequency.quantity, frequency.interval);
    const nextOccurrence = Date.now() + repeatMs; // all time to be stored in milliseconds

    // creating a new chore to add to database
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

    // get the user that is creating the chore
    const userID = req.user.id;
    const user = await User.findOne({ _id: userID }); // search for the user

    //add the new chore to the list of chores that the user has created
    user.chores.push(savedChore._id);
    await user.save();

    return res.status(201).json({ Chore: savedChore });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Chore could not be created" });
  }
}; //createChore

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
    // Return an error message in the response in case of any unexpected errors
    res.status(500).json({ message: "Internal Server Error" });
  }
}; //getAllChores

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
}; //getSingleChore

/*
 ** This function edits the details of an existing chore
 ** @param {Object} req - The request object
 ** @param {Object} res - The response object
 */
export const editChore = async (req, res) => {
  try {
    const id = req.params.id;

    const chore = await Chore.findByIdAndUpdate({ _id: id }, req.body, {
      new: true,
    });

    if (chore === null) {
      return res
        .status(404)
        .json({ message: `Chore with id ${id} was not found` });
    }
    return res.status(201).json(chore);
  } catch (error) {
    console.error(error);
    // Return an error message in the response in case of any unexpected errors
    res.status(500).json({ message: "Internal Server Error" });
  }
}; //editChore

/*
 ** This function deletes a chore from the chore database as well as user chore list
 ** @param {Object} req - The request object
 ** @param {Object} res - The response object
 */
export const deleteChore = async (req, res) => {
  try {
    const choreId = req.params.id;
    // delete chore from chores database
    await Chore.findByIdAndDelete({ _id: choreId });

    // get the user that is deleting the chore
    const userID = req.user.id;
    const user = await User.findOne({ _id: userID }); // search for the user

    // Get the list of chores for the user
    let userChores = [...user.chores];

    // remove chore id from the users chore array
    const idIndex = userChores.findIndex(
      (val) => choreId == val._id.toString()
    );

    if (idIndex > -1) {
      // only splice array when id is found
      userChores.splice(idIndex, 1);

      // assigning the updated array to user.chores
      user.chores = [...userChores];
      await user.save();
      return res
        .status(200)
        .json({ message: `Chore with id ${choreId} deleted successfully!` });
    } else {
      // console.log("Chore ID not found in user's chore list!")
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } catch (error) {
    console.error(error);
    // Return an error message in the response in case of any unexpected errors
    res.status(500).json({ message: "Internal Server Error" });
  }
}; //deleteChore

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
        .json({ message: `Chore with id ${id} was not found` });
    }

    checkOffTime = Date.now();
    // adding the check off time in the array of chores last checked off list
    chore.lastCheckedOff.push(checkOffTime);

    const repeatMs = repeatInMs(chore.quantity, chore.interval);
    // updating next occurrence
    const nextOccurrence = checkOffTime + repeatMs; // all time to be stored in milliseconds
    chore.nextOccurrence = nextOccurrence;
    chore.save();

    return res.status(201).json(chore);
  } catch (error) {
    console.error(error);
    // Return an error message in the response in case of any unexpected errors
    res.status(500).json({ message: "Internal Server Error" });
  }
}; //checkOffChore
