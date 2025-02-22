const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
const multer = require("multer");
const sharp = require("sharp");

// Regular multer storage
// const multerStorage = multer.diskStorage({
//   destination: (req, file, callBack) => {
//     callBack(null, "public/img/users");
//   },
//   filename: (req, file, callBack) => {
//     // user-id-time.jpg / user-8374187263746812634-481672312631.jpg
//     const extension = file.mimetype.split("/")[1];
//     callBack(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//   },
// });

// Multer memory storage
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

const uploadUserPhoto = upload.single("photo");

const resizeUserPhoto = catchAsync(async function (req, res, next) {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  // Resize 500x500 for square images
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

function filterObject(object, ...allowedFields) {
  const newObject = {};
  Object.keys(object).forEach((item) => {
    if (allowedFields.includes(item)) newObject[item] = object[item];
  });

  return newObject;
}

// Admin Commands
// const getAllUsers = catchAsync(async function (req, res, next) {
//   const users = await User.find().select("-__v");
//   res.status(200).json({ status: "success", data: users });
// });

function createUser(req, res) {
  res.status(500).json({
    status: "error",
    message: "This route is not defined. Please use /signup instead",
  });
}

// function getUser(req, res) {
//   res
//     .status(500)
//     .json({ status: "error", message: "This route is not yet defined" });
// }

// function updateUser(req, res) {
//   res
//     .status(500)
//     .json({ status: "error", message: "This route is not yet defined" });
// }

const getAllUsers = factory.getAll(User);
const getUser = factory.getOne(User);
// Do NOT update passwords with this
const deleteUser = factory.deleteOne(User);
const updateUser = factory.updateOne(User);

// User commands

const updateMe = catchAsync(async function (req, res, next) {
  // Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        "This route is not for password updates, please use the correct route - /update-password",
        400
      )
    );

  // Update user document
  // Do not use req.body as this will allow the users to change everything including the roles, reset tokens and other sensitive stuff they should not be touching
  // Filtered out field names that are not allowed to be updated
  const filteredBody = filterObject(req.body, "name", "email");
  if (req.file) filteredBody.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: "success", data: { user: updatedUser } });
});

const deleteMe = catchAsync(async function (req, res, next) {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({ status: "success", data: null });
});

function getMe(req, res, next) {
  req.params.id = req.user.id;
  next();
}

module.exports = {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
};
