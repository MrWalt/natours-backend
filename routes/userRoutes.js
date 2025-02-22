const express = require("express");
const multer = require("multer");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const {
  signUp,
  login,
  resetPassword,
  forgotPassword,
  updatePassword,
  protect,
  restrictTo,
  logout,
} = authController;

const {
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
} = userController;

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);

// After this point, all of these routes are protected and require the user to be logged in
router.use(protect);

router.get("/me", getMe, getUser);
router.patch("/update-me", uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete("/delete-me", deleteMe);
router.patch("/update-password", updatePassword);

// After this point, only admins will be able to do these actions
router.use(restrictTo("admin"));

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
