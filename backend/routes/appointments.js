const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");

// Get all available appointment slots
router.get("/available", async (req, res) => {
  try {
    const availableSlots = await Appointment.find({ isAvailable: true }).sort({
      date: 1,
      startTime: 1,
    });
    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
