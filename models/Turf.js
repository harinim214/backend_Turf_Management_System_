const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  userName: String,
  rating: Number,
  comment: String,
  date: { type: Date, default: Date.now }
});

const turfSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  pricePerHour: { type: Number, required: true },
  image: { type: String, required: true },

  rating: { type: Number, default: 0 },
  reviews: [reviewSchema],

  availableSlots: [
    "6:00 AM - 7:00 AM",
    "7:00 AM - 8:00 AM",
    "5:00 PM - 6:00 PM",
    "6:00 PM - 7:00 PM"
  ],

  amenities: {
    parking: { type: Boolean, default: true },
    washroom: { type: Boolean, default: true },
    floodlights: { type: Boolean, default: true },
    drinkingWater: { type: Boolean, default: true }
  },

  coordinates: {
    latitude: Number,
    longitude: Number
  }

}, { timestamps: true });

module.exports = mongoose.model("Turf", turfSchema);