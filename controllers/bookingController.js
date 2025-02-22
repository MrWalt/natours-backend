const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const {
  getOne,
  updateOne,
  createOne,
  deleteOne,
  getAll,
} = require("./handlerFactory");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const getCheckoutSession = catchAsync(async function (req, res, next) {
  // Get currently booked tyour
  const tour = await Tour.findById(req.params.tourId);
  // Create a checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://natours.dev/img/tours/${tour.imageCover}`],
          },
        },
      },
    ],
  });
  // Send it to the client
  res.status(200).json({ status: "success", session });
});

// Temporary solution, very unsecure, will change later in production
const createBookingCheckout = catchAsync(async function (req, res, next) {
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split("?")[0]);
});

const getBooking = getOne(Booking);
const createBooking = createOne(Booking);
const updateBooking = updateOne(Booking);
const deleteBooking = deleteOne(Booking);
const getAllBookings = getAll(Booking);

module.exports = {
  getCheckoutSession,
  createBookingCheckout,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  getAllBookings,
};
