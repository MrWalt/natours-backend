// const catchAsync = require("../utils/catchAsync");
const Review = require("../models/reviewModel");
const factory = require("./handlerFactory");

// const getAllReviews = catchAsync(async function (req, res, next) {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };

//   const reviews = await Review.find(filter);

//   res.status(200).json({
//     status: "success",
//     data: {
//       reviews,
//     },
//   });
// });

function setTourUserIds(req, res, next) {
  // Allowing nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
}

// const createReview = catchAsync(async function (req, res, next) {
//   const newReview = await Review.create(req.body);

//   res.status(201).json({ status: "success", data: { review: newReview } });
// });
const getAllReviews = factory.getAll(Review);
const createReview = factory.createOne(Review);
const getReview = factory.getOne(Review);
const updateReview = factory.updateOne(Review);
const deleteReview = factory.deleteOne(Review);

module.exports = {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
};
