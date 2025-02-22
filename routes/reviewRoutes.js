const express = require("express");

const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
} = reviewController;

const { protect, restrictTo } = authController;

const router = express.Router({
  mergeParams: true,
});
// mergeParams gives us access to the params from the previous route, in this case we will get access to tourId

// POST tour/dshfsd784632469182734/reviews
// GET /reviews
// All of these will now lead to this router as in tourRoutes.js we defined it like so

router.use(protect);

router
  .route("/")
  .get(getAllReviews)
  .post(restrictTo("user"), setTourUserIds, createReview);

router
  .route("/:id")
  .get(getReview)
  .delete(restrictTo("user", "admin"), deleteReview)
  .patch(restrictTo("user", "admin"), updateReview);

module.exports = router;
