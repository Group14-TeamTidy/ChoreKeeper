import mongoose from "mongoose";
import makeApp from "./index.js";

const app = makeApp(mongoose); // connect to databse
const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`connected to server on ${PORT}`));
