const express = require("express");
const router = express.Router();
const Sale = require("../models/sales");
const Purchase = require("../models/purchase");
const { protect, ownerOnly } = require("../middleware/auth");

// ---------------- CREATE SALE (DEV, no transactions) ----------------
router.post("/", protect, async (req, res) => {
  try {
    const { items, saleType, buyer, custname } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: "No items provided" });
    }

    const saleItems = [];

    for (const item of items) {
      const { productId, quantity, soldPrice: customPrice } = item;

      if (!productId) return res.status(400).json({ message: "productId is required" });
      if (!quantity || quantity <= 0) return res.status(400).json({ message: `Quantity must be > 0` });

      const product = await Purchase.findById(productId);
      if (!product || product.quantity < quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product?.productName || "Unknown"}. Available: ${product?.quantity || 0}`,
        });
      }

      const finalSoldPrice = customPrice || (buyer === "wholesale" ? product.wholesalePrice : product.customerPrice);

      saleItems.push({
        productId: product._id,      // ✅ Required by schema
        productName: product.productName,
        quantity,
        soldPrice: finalSoldPrice,
        actualPrice: product.purchasePrice,
      });

      // Reduce stock
      product.quantity -= quantity;
      await product.save();
    }

    const sale = new Sale({
      owner: req.user.id,
      salesperson: req.user.name,
      items: saleItems,
      saleType,
      buyer,
      custname,
    });

    const savedSale = await sale.save();
    res.status(201).json(savedSale);

  } catch (err) {
    console.error("Create sale error:", err);
    res.status(500).json({ message: err.message });
  }
});


// ---------------- GET SALES ----------------
router.get("/", protect, async (req, res) => {
  try {
    const {
      productName,
      buyer,
      saleType,
      startDate,
      endDate,
      page,
      limit,
      sortField,
      sortOrder,
    } = req.query;

    let filter = {};

    if (productName) filter["items.productName"] = productName;
    if (buyer) filter.buyer = buyer;
    if (saleType) filter.saleType = saleType;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.saleDate = { $gte: start, $lte: end };
    }

    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const sortBy = sortField || "saleDate";
    const order = sortOrder === "desc" ? -1 : 1;

    const sales = await Sale.find(filter)
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limitNumber);

    const total = await Sale.countDocuments(filter);

    res.json({
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      sales,
    });
  } catch (err) {
    console.error("Get sales error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ---------------- DELETE SALE ----------------
router.delete("/:id", protect, ownerOnly, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    // Restore stock
    for (const item of sale.items) {
      const purchase = await Purchase.findById(item.productId);
      if (purchase) {
        purchase.quantity += item.quantity;
        await purchase.save();
      }
    }

    await sale.deleteOne();
    res.json({ success: true, message: "Sale deleted and stock restored" });
  } catch (err) {
    console.error("Delete sale error:", err);
    res.status(500).json({ message: "Server error while deleting sale" });
  }
});

module.exports=router;
