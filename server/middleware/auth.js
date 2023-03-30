import jwt from "jsonwebtoken";

// Middleware to verify the token
export const verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(403).send("Access Denied");
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }

    // Verify the request token and extract the user id from it
    jwt.verify(token, process.env.JWT_SECRET, (err, id) => {
      if (err) return res.sendStatus(403);
      req.user = id;
    });

    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
