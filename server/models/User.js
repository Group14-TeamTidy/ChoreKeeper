const mongoose = require("mongoose");
const { Schema } = mongoose;

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
  receiveNotifs: {
    type: Boolean,
    required: true,
    default: false,
  },
  chores: [{ type: Schema.Types.ObjectId, ref: "Chore" }],
});

module.exports = mongoose.model("User", UserSchema);
