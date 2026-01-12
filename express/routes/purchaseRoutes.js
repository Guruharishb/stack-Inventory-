const express = require("express");
const router = express.Router();
const Purchase = require("../models/purchase");
const { protect, ownerOnly } = require("../middleware/auth");

// Add purchase (Owner only)
router.post("/", protect, ownerOnly, async (req, res) => {
  try {
    const purchase = new Purchase(req.body);
    const savedPurchase = await purchase.save();
    res.status(201).json(savedPurchase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all purchases (Owner only)
router.get("/", protect, async (req, res) => {
  try {
    const purchases = await Purchase.find();
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete purchase by ID (Owner only)
router.delete("/:id", protect, ownerOnly, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ message: "Purchase not found" });

    await purchase.deleteOne();
    res.json({ message: "Purchase deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports=router;
