import express from "express";
import Registration from "../models/Registration.js";

const router = express.Router();
const MAX_SLOTS = 50;

// Middleware to check admin secret
const adminAuth = (req, res, next) => {
  const secret = req.headers["x-admin-secret"];
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ message: "Unauthorized: Invalid secret" });
  }
  next();
};

// GET ADMIN DATA
router.get("/admin-data", adminAuth, async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ _id: -1 });

    const usedSlots = registrations.length;
    const remainingSlots = MAX_SLOTS - usedSlots;

    res.json({
      totalSlots: MAX_SLOTS,
      usedSlots,
      remainingSlots,
      registrations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching admin data" });
  }
});

// DELETE REGISTRATION
router.delete("/delete/:id", adminAuth, async (req, res) => {
  try {
    await Registration.findByIdAndDelete(req.params.id);
    res.json({ message: "Registration deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting registration" });
  }
});

export default router;