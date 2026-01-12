const express = require("express");
const router = express.Router();
const Sale = require("../models/sales");
const Purchase = require("../models/purchase");
const Employee = require("../models/Employee");

// GET /api/dashboard/summary
router.get("/summary", async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    // 🔹 Start of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // 🔹 Fetch paid sales from this month only
    const monthlySales = await Sale.find({
      saleDate: { $gte: startOfMonth },
      status: "paid" // ✅ only include paid sales
    });

    // 🔹 Total Sales Amount (paid sales)
   /* const totalSales = monthlySales.reduce(
      (sum, sale) =>
        sum +
        sale.items.reduce((s, i) => s + i.soldPrice * i.quantity, 0),
      0
    );*/
     const todaySalesData = await Sale.find({
      saleDate: { $gte: startOfToday },
      status: "paid"
    });
    
    // 🔹 Today's Sales Amount
    const todaySales = todaySalesData.reduce(
      (sum, sale) =>
        sum +
        sale.items.reduce((s, i) => s + i.soldPrice * i.quantity, 0),
      0
    );

    // 🔹 Monthly Profit (paid sales)
    const profit = monthlySales.reduce(
      (sum, sale) =>
        sum +
        sale.items.reduce((s, i) => s + (i.soldPrice - i.actualPrice) * i.quantity, 0),
      0
    );

    // 🔹 Low stock (<5)
    const lowStock = await Purchase.countDocuments({
      quantity: { $lt: 5 }
    });

    // 🔹 Total employees
    const employees = await Employee.countDocuments();

    res.json({
      sales: todaySales,
      profit,
      lowStock,
      employees
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports=router;
