import { check, validationResult } from "express-validator";
// MODELS
import DailySchedule from "../models/DailySchedule.js";
import Chore from "../models/Chore.js";
import User from "../models/User.js";

/*
 ** This function creates a new schedule for the day
 ** @param {Object} req - The request object
 ** @param {Object} res - The response object
 */
 export const createDailySchedule = async (req, res) => {

    // Sanitize data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // const timeframe = req.querry.timeframe; //extracting timeframe from request

        var dailySchedule = []; // will add chores for the day in here

        // get the user that is requesting the schedule
        const userID = req.user.id;
        const user = await User.findOne({ _id: userID }); // search for the user
        const choreList = user.chores;
        
        console.log("Printing chore ids for this user")

        // todays date in ms
        const today = Date.now();

        for (const choreId of choreList) {
            // console.log(choreId);
            const chore = await Chore.findOne({ _id: choreId });

            if (!chore) {
                return res.status(404).json({ message: "Chore not found" });
            }

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

            // calculating difference in days of the chore created vs now
            const diffInMs = today - chore.createdAt;
            const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

            // now if the chore is scheduled for today, add it to the schedule list
            if (diffInDays % repeatInDays == 0) {
                const scheduleItem = {choreObj: chore, isCompleted: false};
                dailySchedule.push(scheduleItem);
            }
        }

        const newSchedule = new DailySchedule({dailySchedule});
        // Save to database
        const savedSchedule = await newSchedule.save();

        //add the new schedule id to the list of schedule for this user
        user.schedules.push(savedSchedule._id);
        await user.save();

        return res.status(201).json({ savedSchedule });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Schedule could not be created" });
      }
 }; // createDailySchedule