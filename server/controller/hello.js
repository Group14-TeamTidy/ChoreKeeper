export const sayHello = async (req, res) => {
  console.log(req.url);
  res.status(200).send("Hello World!");
};
