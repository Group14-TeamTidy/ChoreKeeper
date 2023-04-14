const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const cron = require("node-cron");
const userRoute = require("./routes/user.js");
const choreRoute = require("./routes/chore.js");
const scheduleRoute = require("./routes/schedule.js");
const { register, login } = require("./controller/user.js");
const { startEmailService } = require("./services/emailNotifier.js");

/*
 ** @params database: the database the application will connect to
 ** This function connects the appalication to the database specified
 */
module.exports.makeApp = (database, connectionURL) => {
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

  //DB CONNECTION -- for testing purposes, db can be disconnected by passing no arguments to makeApp
  if (database != undefined) {
    database.connect(connectionURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    database.set("strictQuery", true);
    // start email notifier to run at 12am everyday
    cron.schedule("0 0 * * *", () => {
      startEmailService();
    });
  }

  return app;
};
