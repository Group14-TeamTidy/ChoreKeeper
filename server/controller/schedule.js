// MODELS
const Chore = require("../models/Chore.js");
const User = require("../models/User.js");

/*
 ** This function creates a new schedule for the given date
 ** @param {Object} req - The request object
 ** @param {Object} res - The response object
 */
module.exports.createSchedule = async (req, res) => {
  try {
    // Extracting date of the schedule requested
    const dateString = req.params.timeframe;
    const timeframeInMs = new Date(dateString).getTime();

    const requestedSchedule = []; // Will add chores for the day in here

    // Get the user that is requesting the schedule
    const userID = req.user.id;
    const user = await User.findOne({ _id: userID }); // Search for the user
    const choreIdList = user.chores;
    const choreList = await Chore.find({ _id: { $in: choreIdList } });

    for (const chore of choreList) {
      // Mapping interval into days
      let intervalToDays;
      if (chore.frequency.interval === "days") {
        intervalToDays = 1;
      } else if (chore.frequency.interval === "weeks") {
        intervalToDays = 7;
      } else if (chore.frequency.interval === "months") {
        intervalToDays = 30; // Just defaulting to 30
      } else {
        intervalToDays = 365; // Interval is in years
      }

      // Calculating how many days this chore is to be repeated
      const repeatInDays = chore.frequency.quantity * intervalToDays;

      // Calculating difference in days between nextOccurrence and the requested schedule date
      const diffInMs = timeframeInMs - chore.nextOccurrence;
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      // Now if the chore is scheduled for the given date, add it to the schedule list
      if (diffInDays % repeatInDays === 0) {
        requestedSchedule.push(chore);
      }
    }

    return res.status(201).json({ requestedSchedule });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Schedule could not be created." });
  }
}; // createSchedule
