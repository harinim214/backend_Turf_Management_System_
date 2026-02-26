const Booking = require("../models/Booking");
const Turf = require("../models/Turf");
const mongoose = require("mongoose");
// ✅ CREATE BOOKING (MAX 3 TEAMS PER SLOT)
exports.createBooking = async (req, res) => {
  try {
    const { turf, date, slot } = req.body;

    const turfData = await Turf.findById(turf);
    if (!turfData) {
      return res.status(404).json({ message: "Turf not found" });
    }

    // Count existing confirmed bookings
    const existingCount = await Booking.countDocuments({
      turf,
      date,
      slot,
      status: "confirmed",
    });

    if (existingCount >= 3) {
      return res
        .status(400)
        .json({ message: "No slot available (Max 3 teams reached)" });
    }

    const booking = await Booking.create({
      user: req.user.id,
      turf,
      date,
      slot,
      totalAmount: turfData.pricePerHour,
      status: "confirmed",
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: "turf",
        select: "name location pricePerHour image"
      });

    console.log("BOOKINGS:", JSON.stringify(bookings, null, 2)); // 👈 ADD THIS

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET ALL BOOKINGS (ADMIN)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user")
      .populate("turf");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getBookedSlotsByDate = async (req, res) => {
  try {
    const { turfId, date } = req.params;

    const bookings = await Booking.aggregate([
      {
        $match: {
          turf: new mongoose.Types.ObjectId(turfId),
          date: date,
          status: "confirmed",
        },
      },
      {
        $group: {
          _id: "$slot",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ✅ ANALYTICS API
exports.getAnalytics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total Revenue
    const totalRevenue = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    // Monthly Revenue
    const monthlyRevenue = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // Today Bookings
    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: today },
    });

    // Most Popular Slot
    const popularSlot = await Booking.aggregate([
      { $group: { _id: "$slot", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    // Most Booked Turf
    const popularTurf = await Booking.aggregate([
      { $group: { _id: "$turf", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue,
      todayBookings,
      popularSlot: popularSlot[0]?._id || "N/A",
      popularTurf: popularTurf[0]?._id || "N/A",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only owner of booking can cancel
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};