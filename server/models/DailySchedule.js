import mongoose, { Schema } from "mongoose";

const DailyScheduleSchema = new mongoose.Schema({
    dailySchedule: [{choreObj: Object, isCompleted: Boolean}],
});

const DailySchedule = mongoose.model("DailySchedule", DailyScheduleSchema);
export default DailySchedule;
