import makeApp from "./index.js";

const app = makeApp(/*dabase*/); // connect to databse
const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`connected to server on ${PORT}`));
