const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["owner", "employee"],
    default: "employee"
  },

  salary: { type: Number },

  phone: { type: String },

  address: { type: String },

  isActive: { type: Boolean, default: true },

  joiningDate: { type: Date, default: Date.now },

  
  lastLogin: { type: Date },   
  

}, { timestamps: true });


//Hash password before saving
employeeSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});



//Compare password
employeeSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports=mongoose.model("Employee", employeeSchema);
