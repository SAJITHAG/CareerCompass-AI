import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protects a route: requires a valid "Bearer <token>" Authorization header.
// Attaches the authenticated user (without password) to req.user.
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — no token provided.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — user no longer exists.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    // Let the central error handler translate JsonWebTokenError /
    // TokenExpiredError into friendly messages.
    next(err);
  }
};
