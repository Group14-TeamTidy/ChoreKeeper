import mongoose from "mongoose";
import makeApp from "./index.js";

const app = makeApp(mongoose); // connect to databse
// const app = makeApp(); // start without connecting to database for testing
const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`connected to server on ${PORT}`));
