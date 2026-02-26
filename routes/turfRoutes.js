const express = require("express");
const router = express.Router();

const {
  getTurfs,
  addTurf,
  updateTurf,
  deleteTurf,
} = require("../controllers/turfController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { getSingleTurf } = require("../controllers/turfController");
const { addReview } = require("../controllers/turfController");


// Public route
router.get("/", getTurfs);


// Admin routes
router.post("/", protect, authorizeRoles("admin"), addTurf);
router.put("/:id", protect, authorizeRoles("admin"), updateTurf);
router.delete("/:id", protect, authorizeRoles("admin"), deleteTurf);
router.post("/:id/review", protect, addReview);
router.get("/:id", getSingleTurf);


module.exports = router;
