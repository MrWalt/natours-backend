const Booking = require("../models/bookingModel");
const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const getOverview = catchAsync(async function (req, res) {
  // 1. Get tour data from collection
  const tours = await Tour.find();

  // 2. Build template

  // 3. Render template using tour data from 1.

  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

const getTour = catchAsync(async function (req, res, next) {
  const tour = await Tour.findOne({ slug: req.params.tourSlug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  if (!tour) return next(new AppError("There is no tour with that name", 404));

  res.status(200).render("tour", {
    title: tour.name,
    tour,
  });
});

const getLoginForm = function (req, res) {
  res.status(200).render("login", {
    title: "Log into your account",
  });
};

const getAccount = function (req, res) {
  res.status(200).render("account", {
    title: "Your account",
  });
};

const getMyTours = catchAsync(async function (req, res) {
  // Find all bookings

  const bookings = await Booking.find({ user: req.user.id });

  // Find tours with the returned ids

  const tourIds = bookings.map((item) => item.tour);
  // This selects all the tours that have an id that is in tourIds
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render("overview", {
    title: "My Tours",
    tours,
  });
});

const updateUserData = catchAsync(async function (req, res) {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    { new: true, runValidators: true }
  );

  res.status(200).render("account", {
    title: "Your account",
    user: updatedUser,
  });
});

module.exports = {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updateUserData,
  getMyTours,
};
