const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookedSlotsByDate,
  getAnalytics,
  cancelBooking
} = require("../controllers/bookingController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// Create booking (User)
router.post("/", protect, createBooking);

// Get logged-in user bookings
router.get("/my", protect, getMyBookings);

// Admin: get all bookings
router.get("/", protect, authorizeRoles("admin"), getAllBookings);

// Get booked slots by date
router.get("/date/:turfId/:date", getBookedSlotsByDate);

// Admin analytics
router.get("/analytics", protect, authorizeRoles("admin"), getAnalytics);
// cancel booking
router.put("/:id/cancel", protect, cancelBooking);
module.exports = router;