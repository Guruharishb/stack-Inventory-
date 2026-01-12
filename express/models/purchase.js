const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  purchasePrice: { type: Number, required: true },  
  customerPrice: { type: Number, required: true },  
  wholesalePrice: { type: Number },                  
  supplier: { type: String },
  purchaseDate: { type: Date, default: Date.now },
}, { timestamps: true });

const Purchase = mongoose.model("Purchase", purchaseSchema);
module.exports=Purchase;
