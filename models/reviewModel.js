const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "You cannot submit an empty review"],
    },
    rating: {
      type: Number,
      required: [true, "You must leave a rating on your review"],
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

reviewSchema.index(
  { tour: 1, user: 1 },
  {
    unique: true,
  }
);

// Populating the tour and the user in the review
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });

  next();
});

// We created a static method to calcualate the average rating and the number of ratings for a tour, we did this as static method because we want to call it on the model itself and not on the document, why do we want to call it on the model? Because we want to call it after a review has been saved, updated or deleted, so we can't call it on the document because we don't have access to the document in the document middleware, so we call it on the model instead
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  // We save these stats to the tour document
  if (stats.length)
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingAverage: stats[0].avgRating,
    });
  else
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingAverage: 4.5,
    });
};

reviewSchema.post("save", function () {
  // this points to the current review

  // Finally we call the static method to calculate the average ratings
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  // We have to await the query because we need the document to calculate the average ratings
  this.rev = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); // Does NOT work here, query has already been executed
  await this.rev.constructor.calcAverageRatings(this.rev.tour);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
