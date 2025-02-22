const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { promisify } = require("util");
const Email = require("../utils/email");
const crypto = require("crypto");
const { appendFile } = require("fs");

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
}

function createAndSendToken(user, statusCode, res) {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  // This is how we define a cookie
  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
}

const signUp = catchAsync(async function (req, res, next) {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const url = `${req.protocol}://${req.get("host")}/me`;
  await new Email(newUser, url).sendWelcome();

  // const newUser = await User.create(req.body) // This is very bad as it will allow anyone to register an admin account
  createAndSendToken(newUser, 201, res);
  // const token = signToken(newUser._id);

  // res.status(201).json({
  //   status: "success",
  //   token,
  //   data: {
  //     user: newUser,
  //   },
  // });
});

const login = catchAsync(async function (req, res, next) {
  const { email, password } = req.body;

  // Check if email and password exit
  if (!email || !password)
    return next(new AppError("Email and password are required", 400));

  // Check if the user exists and password is correct
  const user = await User.findOne({ email }).select("+password -__v");

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError("Incorrect email or password", 401));

  // If everything is okay, send the token to the client
  createAndSendToken(user, 200, res);
  // const token = signToken(user._id);

  // res.status(200).json({ status: "success", token });
});

const forgotPassword = catchAsync(async function (req, res, next) {
  // Get user based on email
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(new AppError("There is no user with that email address", 404));
  // Generate random reset token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send back as email

  try {
    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/reset-password/${resetToken}`;
    // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to :${resetURL}.\n If you didnt forget your password please ignore this email`;
    // await sendEmail({
    //   email: user.email,
    //   subject: "Password Reset",
    //   message,
    // });

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    (user.passwordResetToken = undefined),
      (user.passwordResetExpires = undefined),
      await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later", 500)
    );
  }
});

const resetPassword = catchAsync(async function (req, res, next) {
  // Get user based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // Set new password only if token has not expired and there is a sure
  if (!user)
    return next(new AppError("Reset token is invalid or has expired", 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // Update changedPasswordAt property for the user

  // Log the user in / Send JWT
  createAndSendToken(user, 200, res);
  // const token = signToken(user._id);
  // res.status(200).json({ status: "success", token });
});

const updatePassword = catchAsync(async function (req, res, next) {
  // Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // Check if POSTed password is correct
  const { passwordCurrent, password, passwordConfirm } = req.body;
  if (
    !passwordCurrent ||
    !(await user.correctPassword(passwordCurrent, user.password))
  )
    return next(new AppError("Incorrect current password", 401));
  // If so, update the password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate() // We did not use this as it does not trigger our save middleware and also our validation will not work
  // Log the user in / Send JWT to user
  createAndSendToken(user, 201, res);
});

////////////////////////////////////////////////////////////////////////////////////
// Middleware

const protect = catchAsync(async function (req, res, next) {
  let token;
  // Getting the token and check if its there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ").at(1);
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token)
    return next(new AppError("You are not logged in. Please log in", 401));

  // Verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if the user still exists
  const user = await User.findById(decoded.id);
  if (!user)
    return next(
      new AppError("The user belonging to this token no longer exits", 401)
    );
  // Check if the user changed password after the token was issued

  if (user.changedPasswordAfterToken(decoded.iat))
    return next(
      new AppError("Password was recently changed. Please log in again", 401)
    );

  // Grants access to the protected route
  req.user = user;
  res.locals.user = user;
  next();
});

const logout = function (req, res) {
  res.clearCookie("jwt");
  res.status(200).json({ status: "success" });
};

// Only for rendered pages, will never throw an error
const isLoggedIn = async function (req, res, next) {
  try {
    if (req.cookies.jwt) {
      // Verify the token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // Check if the user still exists
      const user = await User.findById(decoded.id);
      if (!user) return next();
      // Check if the user changed password after the token was issued

      if (user.changedPasswordAfterToken(decoded.iat)) return next();

      // There is a logged in user

      // This res.locals is for pug only, will probably never use in practice, react gamer
      res.locals.user = user;
    }
  } catch (err) {
    return next();
  }
  next();
};

const restrictTo = function (...roles) {
  return (req, res, next) => {
    // We use closures and array destructuring (roles is an array)
    if (!roles.includes(req.user.role))
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    next();
  };
};

module.exports = {
  signUp,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  isLoggedIn,
  logout,
};
