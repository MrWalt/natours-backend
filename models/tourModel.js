const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
// const User = require("./userModel");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tour must have a name"],
      unique: true,
      trim: true,
      maxLength: [40, "Tour name can not be longer than 40 characters"],
      minLength: [10, "Tour name must be longer than 10 characters"],
      // validate: [validator.isAlpha, "Tour name must only contain characters"],
    },
    slug: String,
    price: {
      type: Number,
      required: true,
    },
    ratingAverage: {
      type: Number,
      default: 3,
      max: [5, "Rating can not be higher than 5"],
      min: [1, "Rating can not be lower than 1"],
      set: (value) => Math.round(value * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      required: [true, "Tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "Tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "Tour must have a difficulty"],
      enum: {
        message: "Difficulty must be either easy, medium or difficult",
        values: ["easy", "medium", "difficult"],
      },
    },
    discount: {
      type: Number,
      validate: {
        message: "Discount price ({VALUE}) can not be higher than the price",
        // this keyword only points to current document on NEW document creations (Will not work on PATCH or PUT)
        validator: function (value) {
          return value < this.price;
        },
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "Tour must have a summary"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "Tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON - Must have type and coordinates
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // Embedding
    // guides: Array,
    guides: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// tourSchema.index({ price: 1 });
// Compound index
tourSchema.index({ price: 1, ratingAverage: -1 });
tourSchema.index({ slug: 1 });

// We have to use a 2D index cause we are talking about the earths surface
tourSchema.index({ startLocation: "2dsphere" });

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

// Virtually populating the reviews
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

// Document middleware, runs before the .save command and the .create command but not on .insertMany
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Responsible for doing the embedding
// tourSchema.pre("save", async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// We can add another .pre middleware for the .save hook, we just have to use next(), the this keyword in .pre works, doesnt work in .post

// tourSchema.post("save", function (doc, next) {
//   console.log(doc);
//   next();
// });

// Query middleware
// The this keyword will point at the current query not at the current document
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });
  next();
});

// tourSchema.post(/^find/, function (docs, next) {
// console.log(`Query took ${Date.now() - this.start} miliseconds`);
// console.log(docs);
//   next();
// });

// Aggregation middleware
// tourSchema.pre("aggregate", function (next) {
//   // console.log(this);
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
