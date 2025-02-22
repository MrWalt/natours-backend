const AppError = require("../utils/appError");

function sendDevError(error, req, res) {
  if (req.originalUrl.startsWith("/api"))
    return res.status(error.statusCode).json({
      status: error.status,
      error,
      message: error.message,
      stack: error.stack,
    });

  console.error("ERROR: ", error);

  res.status(error.statusCode).render("error", {
    title: "Something went wrong!",
    message: error.message,
  });
}

function sendProdError(error, req, res) {
  if (req.originalUrl.startsWith("/api")) {
    if (error.isOperational)
      return res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });

    res.status(500).json({
      status: "error",
      message: "Something went wrong on our end, sorry",
    });

    return;
  }

  if (error.isOperational)
    return res.status(error.statusCode).render("error", {
      title: "Something went wrong!",
      message: error.message,
    });

  console.error("ERROR: ", error);

  res.status(500).render("error", {
    title: "Something went wrong!",
    message: "Please try again later.",
  });
}

function handleCastErrorDB(error) {
  const message = `Invalid ${error.path}: ${error.value}`;

  return new AppError(message, 400);
}

function handleDuplicateFieldDB(error) {
  const value = error.errmsg
    .match(/"([^"]*)"/)
    .at(0)
    .replaceAll('"', "");
  const message = `Duplicate field value ${value}, please use another value`;

  return new AppError(message, 400);
}

function handleValidationErrorDB(error) {
  const errors = Object.values(error.errors).map((error) => error.message);
  const message = `Invalid input data, ${errors.join(". ")}`;

  return new AppError(message, 400);
}

function handleJWTError() {
  return new AppError("Invalid token. Please log in again", 401);
}

function handleExpiredJWT() {
  return new AppError("Log in session expired. Please log in again", 401);
}
module.exports = function (error, req, res, next) {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendDevError(error, req, res);
    return;
  }

  let castError = Object.create(error);
  if (castError.name === "CastError") castError = handleCastErrorDB(castError);
  if (castError.code === 11000) castError = handleDuplicateFieldDB(castError);
  if (castError.name === "ValidationError")
    castError = handleValidationErrorDB(castError);
  if (castError.name === "JsonWebTokenError")
    castError = handleJWTError(castError);
  if (castError.name === "TokenExpiredError") castError = handleExpiredJWT();

  sendProdError(castError, req, res);
};

// module.exports = (err, req, res, next) => {
//   // console.log(err.stack);

//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || "error";

//   if (process.env.NODE_ENV === "development") {
//     sendErrorDev(err, res);
//   } else if (process.env.NODE_ENV === "production") {
//     let error = { ...err };

//     if (error.name === "CastError") error = handleCastErrorDB(error);
//     if (error.code === 11000) error = handleDuplicateFieldsDB(error);
//     if (error.name === "ValidationError")
//       error = handleValidationErrorDB(error);

//     sendErrorProd(error, res);
//   }
// };
