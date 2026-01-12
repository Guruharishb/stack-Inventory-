const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
  salesperson: { 
        type: String, 
        required: true 
      },
  items: [
    {
       productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Purchase",  // <-- Reference Purchase schema
        required: true,
      },
      productName: { type: String, required: true },
      quantity: { type: Number, required: true },
      soldPrice: { type: Number, required: true },
      actualPrice: { type: Number, required: true }
      
    }
  ],

  saleType: {
    type: String,
    enum: ["cash", "Gpay", "credit"],
    default: "cash"
  },

  buyer: {
    type: String,
    enum: ["customer", "wholesale"],
    default: "customer"
  },

  custname: {
    type: String,
    default: "Occasional"
  },


  status: {
    type: String,
    enum: ["paid", "unpaid"],
    default: function () {
      return this.saleType === "credit" ? "unpaid" : "paid";
    }
  },

  saleDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports=mongoose.model("Sale", salesSchema);
