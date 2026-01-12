const express = require("express");
const router = express.Router();
const Billing = require("../models/billing");
const Sale = require("../models/sales");
const { protect, ownerOnly } = require("../middleware/auth");

// 🔹 GENERATE BILL (ONLY UNPAID CREDIT SALES FOR SPECIFIC CUSTOMERS)
router.post("/generate", protect, ownerOnly, async (req, res) => {
  try {
    const { custNames, startDate, endDate } = req.body;

    if (!custNames || !custNames.length || !startDate || !endDate) {
      return res.status(400).json({ message: "Customer names and dates are required" });
    }

    const from = new Date(startDate);
    const to = new Date(endDate);
    to.setHours(23, 59, 59, 999); // include full end date

    // 🔹 fetch all credit sales for these customers in date range
    const sales = await Sale.find({
      saleType: "credit",
      custname: { $in: custNames },
      saleDate: { $gte: from, $lte: to },
    });

    if (!sales.length) {
      return res.status(400).json({ message: "No unpaid credit sales found for selected customers" });
    }

    let creditSales = [];
    let totalAmount = 0;

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        creditSales.push({
          saleId: sale._id,
          custname: sale.custname,
          productName: item.productName,
          quantity: item.quantity,
          soldPrice: item.soldPrice,
          saleDate: sale.saleDate,
        });

        totalAmount += item.quantity * item.soldPrice;
      });
    });

    const bill = await Billing.create({
      buyer: "customer",
      startDate,
      endDate,
      creditSales,
      totalAmount,
      status: "unpaid",
    });

    res.status(201).json(bill);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// 🔹 GET ALL BILLS
router.get("/", protect, async (req, res) => {
  try {
    const bills = await Billing.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    console.error("GET BILL ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});


// 🔹 PAY / UNPAY BILL
router.patch("/:id/status", protect, ownerOnly, async (req, res) => {
  const bill = await Billing.findById(req.params.id);
  if (!bill) return res.status(404).json({ message: "Bill not found" });

  const newStatus = bill.status === "paid" ? "unpaid" : "paid";
  bill.status = newStatus;
  await bill.save();

  if (newStatus === "paid") {
    const saleIds = bill.creditSales.map((cs) => cs.saleId);
    await Sale.updateMany(
      { _id: { $in: saleIds } },
      { $set: { status: "paid", saleType: "cash" } } // must match dashboard
    );
  }

  res.json(bill);
});

module.exports=router;
