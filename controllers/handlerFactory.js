const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

function getOne(Model, popOptions) {
  return catchAsync(async function (req, res, next) {
    let query = Model.findById(req.params.id);

    if (popOptions) query.populate(popOptions);

    const document = await query;

    if (!document) {
      return next(new AppError(`Could not find document with that ID`, 404));
    }

    res.status(200).json({
      status: "success",
      data: document,
    });
  });
}

function deleteOne(Model) {
  return catchAsync(async function (req, res, next) {
    // try {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      return next(new AppError(`Could not delete document with that ID`, 404));
    }

    res.status(204).json({ status: "success", data: null });
  });
}

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

function updateOne(Model) {
  return catchAsync(async function (req, res, next) {
    // try {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!document) {
      return next(new AppError(`Could not update document with that ID`, 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: document,
      },
    });
  });
}

function createOne(Model) {
  return catchAsync(async function (req, res, next) {
    const newDocument = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: { data: newDocument },
    });
  });
}

function getAll(Model) {
  return catchAsync(async function (req, res, next) {
    // To allow for nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // const document = await features.query.explain();
    const document = await features.query;

    res.status(200).json({
      status: "success",
      results: document.length,
      data: document,
    });
  });
}

module.exports = { deleteOne, updateOne, createOne, getOne, getAll };
