const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");
const { protect, ownerOnly } = require("../middleware/auth"); // your middleware

const SECRET =
  process.env.JWT_SECRET ||
  "olympicprintersapplicationmadebyguru@harishforbilling$&maintain"; // change later

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, SECRET, { expiresIn: "1d" });
};

// -------------------------
// REGISTER EMPLOYEE (OWNER ONLY)
// -------------------------
router.post("/register", protect, ownerOnly, async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("User making request:", req.user);
    const { name, email, password, role = "employee", salary } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const exist = await Employee.findOne({ email });
    if (exist) return res.status(400).json({ message: "Email already registered" });
    
    const employee = new Employee({ name, email, password, role, salary });
    await employee.save();

    res.status(201).json({
      message: "Employee registered successfully",
      employee,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});


// -------------------------
// LOGIN EMPLOYEE
// -------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const emp = await Employee.findOne({ email });
    if (!emp) return res.status(404).json({ message: "Invalid email" });

    const match = await emp.matchPassword(password);
    if (!match) return res.status(401).json({ message: "Invalid password" });

    // Generate JWT token
    const token = generateToken(emp._id, emp.role);

    // Safely update lastLogin
    try {
      emp.lastLogin = new Date();
      await emp.save();
    } catch (err) {
      console.error("Error updating lastLogin:", err);
      // Do NOT block login; just log it
    }

    res.json({
      message: "Login successful",
      token,
      user: {
        id: emp._id,
        name: emp.name,
        email: emp.email,
        role: emp.role,
        lastLogin: emp.lastLogin,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET ALL EMPLOYEES
router.get("/employees", protect, ownerOnly, async (req, res) => {
  try {
    const employees = await Employee.find({ role: "employee" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete employee
router.delete("/employees/:id", protect, ownerOnly, async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);

    if (!emp) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (emp.role === "owner") {
      return res.status(400).json({ message: "Cannot delete owner" });
    }

    await emp.deleteOne();
    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports=router;
