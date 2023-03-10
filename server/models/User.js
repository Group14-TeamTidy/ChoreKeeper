import { mongoose, Schema } from "mongoose";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    max: 50,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 5,
  },
  chores: [{ type: Schema.Types.ObjectId, ref: "Chore" }],
  schedules: [{ type: Schema.Types.ObjectId, ref: "DailySchedule"}]
});

const User = mongoose.model("User", UserSchema);
export default User;
