import { check, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// MODELS
import User from "../models/User.js";

/*
 ** This function creates an account for a new user
 ** @param {Object} req - The request object
 ** @param {Object} res - The response object
 */
export const register = async (req, res) => {
  // Sanitize data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // First check if this user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: `${email} is already in use` });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt();
    const pwdHash = await bcrypt.hash(password, salt);

    // Create user and replace password with encrypted version
    const newUser = new User({ email, password: pwdHash });

    // Save to database
    const savedUser = await newUser.save();

    // Log the user in
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET);

    // Don't send password
    const user = { ...savedUser.toObject() };
    delete user.password;

    return res.status(201).json({ token, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "User could not be created" });
  }
};

/*
 ** This function login in a registerd user
 ** @param {Object} req - The request object
 ** @param {Object} res - The response object
 */
export const login = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }); // search for the user

    //return no user found no user was found
    if (!user) {
      return res
        .status(400)
        .json({ message: `User with email ${email} not found` });
    }

    //if the user was found encrypt the password and compare the passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    //if the passwords are not equal
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    //sign the user in
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    // Don't send password
    const loggedInUser = { ...user.toObject() };
    delete loggedInUser.password;

    res.status(200).json({ token, user: loggedInUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/*
 ** This function finds a registerd user by email
 ** @param {Object} req - The request object
 ** @param {Object} res - The response object
 */
export const getUser = async (req, res) => {
  // Sanitize data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(409).json();
  }

  try {
    const userID = req.user.id;
    const user = await User.findOne({ _id: userID }); // search for the user

    if (!user) {
      return res.status(401).json({ message: `This User does not exist` });
    }
    // Don't send password
    const loggedInUser = { ...user.toObject() };
    delete loggedInUser.password;

    res.status(200).json({ user: loggedInUser });
  } catch (error) {}
};

/*
 ** This function sets the notification settings for the user
 ** @param {Object} req - The request object
 ** @param {Object} res - The response object
 */
 export const setNotifs = async (req, res) => {
  // Sanitize data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(409).json();
  }

  try {
    const receiveNotifs = req.body.receiveNotifs;
    const userID = req.user.id;
    const user = await User.findOne({ _id: userID }); // search for the user

    if (!user) {
      return res.status(401).json({ message: `This User does not exist` });
    }

    if(receiveNotifs != false && receiveNotifs != true) {
      return res.status(400).json({ message: `Cannot set notifications to ${receiveNotifs}`})
    }

    user.receiveNotifs = receiveNotifs;
    console.log("Receive Notifications: " + user.receiveNotifs);
    user.save();

    // Don't send password
    const loggedInUser = { ...user.toObject() };
    delete loggedInUser.password;

    return res.status(201).json({ user: loggedInUser });
  } catch (error) {
    console.error(error);
    // Return an error message in the response in case of any unexpected errors
    res.status(500).json({ message: "Internal Server Error" });
  }
};
