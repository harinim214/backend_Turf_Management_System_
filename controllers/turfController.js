const Turf = require("../models/Turf");
const Booking = require("../models/Booking");

/* ================================
   GET ALL TURFS
================================ */
exports.getTurfs = async (req, res) => {
  try {
    const turfs = await Turf.find();
    res.json(turfs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   ADD TURF
================================ */
exports.addTurf = async (req, res) => {
  try {
    const turf = await Turf.create(req.body);
    res.status(201).json(turf);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   UPDATE TURF
================================ */
exports.updateTurf = async (req, res) => {
  try {
    const turf = await Turf.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(turf);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   DELETE TURF
================================ */
exports.deleteTurf = async (req, res) => {
  try {
    await Turf.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   GET SINGLE TURF
================================ */
exports.getSingleTurf = async (req, res) => {
  try {
    const turf = await Turf.findById(req.params.id);
    res.json(turf);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   ADD REVIEW (SAFE VERSION)
================================ */
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const turfId = req.params.id;

    // Convert rating to number safely
    const numericRating = Number(rating);

    // Validate rating
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      });
    }

    // Check if user has booked this turf
    const hasBooked = await Booking.findOne({
      user: req.user.id,
      turf: turfId,
      status: "confirmed"
    });

    if (!hasBooked) {
      return res.status(403).json({
        message: "You can review only after booking this turf"
      });
    }

    const turf = await Turf.findById(turfId);

    if (!turf) {
      return res.status(404).json({ message: "Turf not found" });
    }

    // Prevent duplicate review by same user
    const alreadyReviewed = turf.reviews.find(
      (review) => review.userName === req.user.name
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        message: "You have already reviewed this turf"
      });
    }

    // Add review
    turf.reviews.push({
      userName: req.user.name,
      rating: numericRating,
      comment
    });

    /* ===========================
       SAFE AVERAGE CALCULATION
    =========================== */

    const totalRatings = turf.reviews.reduce(
      (acc, item) => acc + Number(item.rating || 0),
      0
    );

    const average =
      turf.reviews.length > 0
        ? totalRatings / turf.reviews.length
        : 0;

    turf.rating = Number(average.toFixed(1)); // prevent NaN

    await turf.save();

    res.json({
      message: "Review added successfully",
      turf
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};