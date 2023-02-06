export const sayHello = async (req, res) => {
  console.log(req.method + " " + req.url);
  console.log("Received data: " + JSON.stringify(req.body));
  res.status(200).send("Hello World!");
};
