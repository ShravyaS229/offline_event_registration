import express from "express";
import Registration from "../models/Registration.js";

const router = express.Router();
const MAX_SLOTS = 50;

router.post("/register", async (req, res) => {
  try {
    // 1️⃣ Count total registrations
    const totalRegistrations = await Registration.countDocuments();

    // 2️⃣ Stop if slots full
    if (totalRegistrations >= MAX_SLOTS) {
      return res.status(400).json({
        message: "Registration closed. Slots are full."
      });
    }

    // 3️⃣ Prevent duplicate email or USN
    const existingEmail = await Registration.findOne({ email: req.body.email });
    if (existingEmail) {
      return res.status(400).json({
        message: "Email already registered."
      });
    }

    const existingUSN = await Registration.findOne({ usn: req.body.usn });
    if (existingUSN) {
      return res.status(400).json({
        message: "USN already registered."
      });
    }

    // 4️⃣ Use provided timestamp or add automatically
    if (!req.body.timestamp) {
      req.body.timestamp = Date.now();
    }

    // 5️⃣ Save registration
    const newRegistration = new Registration(req.body);
    await newRegistration.save();

    res.status(201).json({
      message: "Registration successful"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});

export default router;