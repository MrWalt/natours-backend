const express = require("express");
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
// const reviewController = require("../controllers/reviewController");
const reviewRouter = require("../routes/reviewRoutes");

const router = express.Router();

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages,
} = tourController;

const { protect, restrictTo } = authController;

router.use("/:tourId/reviews", reviewRouter);

// router.param("id");
router
  .route("/monthly-plan/:year")
  .get(protect, restrictTo("admin", "guide", "lead-guide"), getMonthlyPlan);
router.route("/stats").get(getTourStats);
router.route("/top-5-cheap").get(aliasTopTours, getAllTours);

// Weird way of specifying route
router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=km // This is one way using query strings
// /tours-within/233/center/-40,45/unit/km // This one is the route above

router.route("/distances/:latlng/unit/:unit").get(getDistances);

router
  .route("/")
  .get(getAllTours)
  .post(protect, restrictTo("admin", "lead-guide"), createTour);
router
  .route("/:id")
  .get(getTour)
  .patch(
    protect,
    restrictTo("admin", "lead-guide"),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(protect, restrictTo("admin", "lead-guide"), deleteTour);

module.exports = router;
