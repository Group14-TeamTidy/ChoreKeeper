import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import hello from "./routes/hello.js";

/*
@params database: the database the application will connect to

This function connects the appalication to the database specified
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

  app.use("/api", hello);
  app.use("/", (req, res) => {
    console.log(req.url);
    res.status(200).send("Lorem Ipsum");
  });

  //DB CONNECTION

  return app;
}
