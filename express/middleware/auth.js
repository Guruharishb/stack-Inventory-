const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

const SECRET = process.env.JWT_SECRET || "olympicprintersapplicationmadebyguru@harishforbilling$&maintain";

exports.protect = async (req, res, next) => {
  // ✅ Allow CORS preflight
  if (req.method === "OPTIONS") {
    return next();
  }

  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);

    const user = await Employee.findById(decoded.id).select("_id name role");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user._id,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

exports.ownerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "owner") {
    return res.status(403).json({ message: "Access denied (Owner only)" });
  }
  next();
};
