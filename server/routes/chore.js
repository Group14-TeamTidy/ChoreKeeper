const express = require("express");
// CONTROLLER FUNCTIONS
const {
  createChore,
  getAllChores,
  editChore,
  getSingleChore,
  deleteChore,
  checkOffChore,
} = require("../controller/chore.js");
// MIDDLEWARE
const { verifyToken } = require("../middleware/auth.js");

const router = express.Router();

//ROUTES
router.get("/", verifyToken, getAllChores); // Get all chores for a user
router.get("/:id", verifyToken, getSingleChore); // Get a single chore
router.put("/:id", verifyToken, editChore); // Edit a chore
router.put("/:id/checked/", verifyToken, checkOffChore); // Check off a chore
router.post("/", verifyToken, createChore); // Create a chore
router.delete("/:id", verifyToken, deleteChore); // Delete a chore

module.exports = router;
