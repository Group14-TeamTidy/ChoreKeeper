import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import userRoute from "./routes/user.js";
import choreRoute from "./routes/chore.js";
import scheduleRoute from "./routes/schedule.js";
import { register, login } from "./controller/user.js";

/*
 ** @params database: the database the application will connect to
 ** This function connects the appalication to the database specified
 */
export default function makeApp(database) {
  // CONFIGURATIONS
  const app = express();
  dotenv.config();
  app.use(express.json());
  app.use(cors());
  app.use(bodyParser.json({ limit: "30mb", extended: true }));
  app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

  // ROUTES
  // add routes here

  app.use("/api/user", userRoute);
  app.use("/api/chores", choreRoute);
  app.use("/api/schedule", scheduleRoute);

  app.post("/api/login", login);
  app.post("/api/signup", register);

  app.use("/api", (req, res) => {
    console.log(req.url);
    res.status(200).send("Hello");
  });
  app.use("/", (req, res) => {
    console.log(req.url);
    res.status(200).send("Lorem Ipsum");
  });

  //DB CONNECTION -- for testing purposes, db can be disconnected by passing no arguments to makeApp
  if (database != undefined) {
    database.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    database.set("strictQuery", true);
  }

  return app;
}
