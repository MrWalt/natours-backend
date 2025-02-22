const Tour = require("../models/tourModel");
const AppError = require("../utils/appError");
// const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
const multer = require("multer");
const sharp = require("sharp");

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// Middleware

// function checkBody(req, res, next) {
//   if (!req.body.name || !req.body.price)
//     return res.status(400).json({ status: "fail", message: "Bad request" });

//   next();
// }

const getAllTours = factory.getAll(Tour);

const createTour = factory.createOne(Tour);
const getTour = factory.getOne(Tour, { path: "reviews", select: "-__v" });
const updateTour = factory.updateOne(Tour);
const deleteTour = factory.deleteOne(Tour);

function aliasTopTours(req, res, next) {
  req.query.limit = "5";
  req.query.sort = "-ratingAverage,price";
  req.query.fields = "name,price,ratingAverage,summary,difficulty";
  next();
}

// Router handlers
// const getAllTours = catchAsync(async function (req, res, next) {
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();

//   const tours = await features.query;

//   res.status(200).json({
//     status: "success",
//     results: tours.length,
//     data: { tours },
//   });
// try {
// console.log(req.query);
// // Build the query
// // Filtering
// const queryObject = { ...req.query };
// const excludedFields = ["page", "sort", "limit", "fields"];
// console.log(queryObject);
// excludedFields.forEach((item) => delete queryObject[item]);

// // Advanced filtering

// let queryString = JSON.stringify(queryObject);
// queryString = queryString.replace(
//   /\b(gte|gt|lte|lt)\b/g,
//   (match) => `$${match}`
// );
// // // Replace gte, gt, lte, lt
// // // {difficulty: "easy", duration: {$gte: 5}}
// // // {difficulty: "easy", duration: {gte: "5"}}
// let query = Tour.find(JSON.parse(queryString));

// // Sorting;
// if (req.query.sort) {
//   const sortBy = req.query.sort.split(",").join(" ");
//   // console.log(sortBy);
//   query = query.sort(sortBy);
// } else {
//   query = query.sort("-createdAt");
// }
// // sort("price ratingAverage");

// // Field limiting
// if (req.query.fields) {
//   const fields = req.query.fields.split(",").join(" ");
//   query = query.select(fields);
// } else {
//   query = query.select("-__v");
// }

// // Pagination
// // page=2&limit=10, 1-10 page 1, 11-20 page 2...
// const page = req.query.page * 1 || 1;
// console.log(page);
// const limit = req.query.limit * 1 || 100;
// const skip = (page - 1) * limit;

// query = query.skip(skip).limit(limit);

// if (req.query.page) {
//   const numTours = await Tour.countDocuments();
//   if (skip >= numTours) throw new Error("Thats all the data we have :\\");
// }

// Execute the query
// const features = new APIFeatures(Tour.find(), req.query)
//   .filter()
//   .sort()
//   .limitFields()
//   .paginate();
// const tours = await features.query;
// const tours = await query;
// query.sort().select().skip().limit() etc...

// const tours = await Tour.find(queryObject);
// Same as the one above
// We can also use .lte .gte .lt .gt .sort ...
// const tours  = await Tour.find().where("difficulty").equals(5)

// Send response
// res.status(200).json({
//   status: "success",
//   results: tours.length,
//   data: { tours },
// });
// } catch (err) {
//   res.status(400).json({ status: "fail", message: "Could not fetch tours" });
// }
// });

// const getTour = catchAsync(async function (req, res, next) {
//   const tour = await Tour.findById(req.params.id).populate("reviews");
//   // .populate({ path: "guides", select: "-__v -passwordChangedAt" })
//   // .select("-__v");
//   // const tour = await query;

//   if (!tour) {
//     return next(new AppError(`Could not find tour with that ID`, 404));
//   }

//   res.status(200).json({
//     status: "success",
//     data: { tour },
//   });

// try {
// let query = Tour.findById(req.params.id);
// query = query.select("-__v");
// const tour = await query;
// const tour = await Tour.findById(req.params.id);
// // Tour.findOne({_id: req.params.id}) ---> Exact same as the line above

// res.status(200).json({
//   status: "success",
//   data: { tour },
// });
// } catch (err) {
//   res.status(404).json({ status: "fail", message: "Could not find tour" });
// }
// });

// const createTour = catchAsync(async function (req, res, next) {
//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: "success",
//     data: { tour: newTour },
//   });

//   // Old way
//   // const newTour = new Tour({});
//   // newTour.save();
//   // try {
//   //   // New way
//   //   const newTour = await Tour.create(req.body);

//   //   res.status(201).json({
//   //     status: "success",
//   //     data: { tour: newTour },
//   //   });
//   // } catch (err) {
//   //   res.status(400).json({ status: "fail", message: err });
//   // }
// });

// const updateTour = catchAsync(async function (req, res, next) {
//   // try {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!tour) {
//     return next(new AppError(`Could not update tour with that ID`, 404));
//   }

//   res.status(200).json({
//     status: "success",
//     data: {
//       tour,
//     },
//   });
//   // } catch (err) {
//   //   res.status(404).json({ status: "fail", message: err });
//   // }
// });

// const deleteTour = catchAsync(async function (req, res, next) {
//   // try {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError(`Could not delete tour with that ID`, 404));
//   }

//   res.status(204).json({ status: "success", data: null });
//   // } catch (err) {
//   //   res.status(400).json({ status: "fail", message: "Could not delete tour" });
//   // }
//   // This is the convention for sending back delete confirmations
// });

const multerStorage = multer.memoryStorage();

const multerFilter = function (req, file, callBack) {
  if (file.mimetype.startsWith("image")) callBack(null, true);
  else
    callBack(
      new AppError("Not an image!, Please upload only images", 400),
      false
    );
};

// Middleware for uploading files
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadTourImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

const resizeTourImages = catchAsync(async function (req, res, next) {
  if (!req.files.imageCover || !req.files.images) return next();

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  // Proccessing the cover image
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // Processing the rest of the images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${fileName}`);

      req.body.images.push(fileName);
    })
  );
  next();
});

// photo.single produces req.file, fields and array will produce .files
// If there was no imageCover we can use upload.array, for single images we use upload.single and for multiple different ones we use .fields

const getTourStats = catchAsync(async function (req, res, next) {
  // try {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingAverage: { $gte: 0 },
      },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        // _id: "$ratingAverage",
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: {
          $avg: "$ratingAverage",
        },
        avgPrice: {
          $avg: "$price",
        },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: {
        avgPrice: -1,
      },
    },
    // {
    //   $match: {
    //   _id: { $ne: "EASY" },
    //   },
    // },
  ]);

  res.status(200).json({
    status: "success",
    data: { stats },
  });
  // } catch (err) {
  //   res.status(404).json({ status: "fail", message: "Could not fetch stats" });
  // }
});

const getMonthlyPlan = catchAsync(async function (req, res, next) {
  // try {
  const year = Number(req.params.year);
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    { $addFields: { month: "$_id" } },
    {
      $project: {
        _id: 0,
      },
    },
    { $sort: { numTourStarts: -1 } },
    { $limit: 12 },
  ]);

  res.status(200).json({ status: "success", data: { plan } });
  // } catch (err) {
  //   res.status(404).json({ status: "fail", message: "Could not fetch stats" });
  // }
});

const getToursWithin = catchAsync(async function (req, res, next) {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  // Some magic numbers, 3963.2 is the radius of the earth in miles and 6378.1 is the radius in kilometers
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!lat && !lng)
    next(
      new AppError(
        "Please provide your location (latitude and longitude) in the format lat,lng",
        400
      )
    );

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

//    /tours-within/:distance/center/:latlng/unit/:unit
//    /tours-within/233/center/34.213821,-118.443428/unit/km

const getDistances = catchAsync(async function (req, res, next) {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  if (!lat && !lng)
    next(
      new AppError(
        "Please provide your location (latitude and longitude) in the format lat,lng",
        400
      )
    );

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      data: distances,
    },
  });
});

module.exports = {
  getAllTours,
  getTour,
  createTour,
  deleteTour,
  updateTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages,
};

// "engines": {
//   "node": ">=10.0.0"
// }
