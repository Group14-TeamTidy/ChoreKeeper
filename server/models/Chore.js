const mongoose = require("mongoose");

const ChoreSchema = new mongoose.Schema({
  name: { type: String, require: true },
  frequency: {
    quantity: Number,
    interval: { type: String, enum: ["days", "weeks", "months", "years"] },
  },
  location: String,
  duration: Number,
  preference: { type: String, enum: ["high", "medium", "low"] },
  lastCheckedOff: [],
  nextOccurrence: Number,
});

module.exports = mongoose.model("Chore", ChoreSchema);
