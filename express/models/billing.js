const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema({
  buyer: { type: String, required: true },

  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },

  creditSales: [
    {
      saleId: { type: mongoose.Schema.Types.ObjectId, ref: "Sale" },
      custname: { type: String },
      productName: String,
      
      quantity: Number,
      soldPrice: Number,
      saleDate: Date
    }
  ],

  totalAmount: { type: Number, required: true },

  status: {
    type: String,
    enum: ["unpaid", "paid"],
    default: "unpaid"
  },

  generatedDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports=mongoose.model("Billing", billingSchema);
