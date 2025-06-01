// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const appointmentRoutes = require("./routes/appointments");
const authRoutes = require("./routes/auth");

// Use routes
app.use("/api/appointments", appointmentRoutes);
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API çalisiyor!");
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log("Sunucu çalisiyor:", PORT);
    });
  })
  .catch((err) => console.error(err));
