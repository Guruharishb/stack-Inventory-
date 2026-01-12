require("dotenv").config();
const express = require("express");
const connectdb = require("./config/db");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.options("*", cors());

connectdb();

app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/purchases", require("./routes/purchaseRoutes"));
app.use("/api/sales", require("./routes/salesRoutes"));
app.use("/api/billing", require("./routes/billingRoutes"));

app.get("/", (req, res) => {
  res.send("Backend is running...");
});


app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR HANDLER:", err);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
