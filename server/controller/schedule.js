import { check, validationResult } from "express-validator";
// MODELS
import Chore from "../models/Chore.js";
import User from "../models/User.js";

/*
 ** This function creates a new schedule for the given date
 ** @param {Object} req - The request object
 ** @param {Object} res - The response object
 */
export const createSchedule = async (req, res) => {
  try {
    // by default, time requested is set to the current time (which will return today's schedule)
    let timeframeInMs = Date.now();

    // if api req contains timeframe, then schedule for that date will be generated
    // if (Object.keys(req.query).length !== 0) {
    //   //extracting timeframe from the request and converting it into milliseconds
    //   timeframeInMs = Date.parse(req.query.timeframe);
    // } Future sprint

    var requestedSchedule = []; // will add chores for the day in here

    // get the user that is requesting the schedule
    const userID = req.user.id;
    const user = await User.findOne({ _id: userID }); // search for the user
    const choreIdList = user.chores;
    const choreList = await Chore.find({ _id: { $in: choreIdList } });

    for (const chore of choreList) {
      // mapping interval into days
      var intervalToDays;
      if (chore.frequency.interval == "days") {
        intervalToDays = 1;
      } else if (chore.frequency.interval == "weeks") {
        intervalToDays = 7;
      } else if (chore.frequency.interval == "months") {
        intervalToDays = 30; // just defaulting to 30
      } else {
        intervalToDays = 365; // intterval is in years
      }

      // calculating how many days this chore is to be repeated
      const repeatInDays = chore.frequency.quantity * intervalToDays;

      console.log(`Repeat in days: ${repeatInDays}`);

      // calculating difference in days between nextOccurrence and the requested schedule date
      const diffInMs = timeframeInMs - chore.nextOccurrence;
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      // now if the chore is scheduled for the given date, add it to the schedule list
      if (diffInDays % repeatInDays == 0) {
        requestedSchedule.push(chore);
      }
    }

    return res.status(201).json({ requestedSchedule });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Schedule could not be created" });
  }
}; // createSchedule
