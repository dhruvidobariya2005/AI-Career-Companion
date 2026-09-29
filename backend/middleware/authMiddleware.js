const jwt = require("jsonwebtoken");

const getJwtSecret = () => process.env.JWT_SECRET || "ai_career_companion_jwt_secret_key_2026";

const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          message: "Not Authorized, token missing",
        });
      }

      const decoded = jwt.verify(token, getJwtSecret());
      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({
        message: "Not Authorized, token failed or expired",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      message: "Not Authorized, no token provided",
    });
  }
};

module.exports = protect;