const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const { protect } = require("../middlewares/authMiddleware");

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

// @desc    Reserve an appointment
// @route   PUT /api/appointments/:id/reserve
// @access  Private
router.put("/:id/reserve", protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (!appointment.isAvailable) {
      return res
        .status(400)
        .json({ message: "Appointment is already reserved" });
    }

    // Update appointment
    appointment.isAvailable = false;
    appointment.reservedBy = req.user._id;

    const updatedAppointment = await appointment.save();

    // Populate user details
    await updatedAppointment.populate("reservedBy", "name email");

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Cancel an appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check if the appointment is already available
    if (appointment.isAvailable) {
      return res.status(400).json({ message: "Appointment is not reserved" });
    }

    // Check if the current user is the one who reserved the appointment
    if (appointment.reservedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this appointment" });
    }

    // Update appointment
    appointment.isAvailable = true;
    appointment.reservedBy = null;

    const updatedAppointment = await appointment.save();

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
