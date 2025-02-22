const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const csp = require("express-csp");
const cors = require("cors");
const compression = require("compression");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Serving static files
app.use(express.static(path.join(__dirname, "public")));

// Global Middlewares
// Set security HTTP headers
// app.use(helmet());

// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = ["https://unpkg.com/", "https://tile.openstreetmap.org"];
const styleSrcUrls = [
  "https://unpkg.com/",
  "https://tile.openstreetmap.org",
  "https://fonts.googleapis.com/",
];
const connectSrcUrls = ["https://unpkg.com", "https://tile.openstreetmap.org"];
const fontSrcUrls = ["fonts.googleapis.com", "fonts.gstatic.com"];
const imageScriptUrls = ["https://tile.jawg.io"];

// Set security http headers

// Old helmet settings
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: [],
//       connectSrc: ["'self'", ...connectSrcUrls],
//       scriptSrc: ["'self'", ...scriptSrcUrls],
//       styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//       workerSrc: ["'self'", "blob:"],
//       objectSrc: [],
//       imgSrc: ["'self'", "blob:", "data:", "https:"],
//       fontSrc: ["'self'", ...fontSrcUrls],
//     },
//   })
// );

app.use(cors());

// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'", "data:", "blob:", "https:", "ws:"],
//         baseUri: ["'self'"],
//         fontSrc: ["'self'", "https:", "data:", ...fontSrcUrls],
//         scriptSrc: [
//           "'self'",
//           "https:",
//           "http:",
//           "blob:",
//           "https://*.mapbox.com",
//           "https://js.stripe.com",
//           "https://m.stripe.network",
//           "https://*.cloudflare.com",
//           "https://js.stripe.com/v3",
//           "https://*.stripe.com",
//           ...scriptSrcUrls,
//         ],
//         "frame-src": [
//           "self",
//           "unsafe-inline",
//           "data:",
//           "blob:",
//           "https://*.stripe.com",
//           "https://*.mapbox.com",
//           "https://*.cloudflare.com/",
//           "https://bundle.js:*",
//           "https://js.stripe.com",
//           "ws://localhost:*/",
//           "wss://*.stripe.com",
//           "https://js.stripe.com/v3",
//         ],
//         objectSrc: ["'none'"],
//         styleSrc: ["'self'", "https:", "'unsafe-inline'", ...styleSrcUrls],
//         workerSrc: [
//           "'self'",
//           "data:",
//           "blob:",
//           "https://*.tiles.mapbox.com",
//           "https://api.mapbox.com",
//           "https://events.mapbox.com",
//           "https://m.stripe.network",
//           "https://*.stripe.com",
//           "https://js.stripe.com",
//         ],
//         childSrc: ["'self'", "blob:"],
//         imgSrc: ["'self'", "data:", "blob:", ...imageScriptUrls],
//         formAction: ["'self'"],
//         connectSrc: [
//           "'self'",
//           "'unsafe-inline'",
//           "data:",
//           "blob:",
//           "https://*.stripe.com",
//           "https://api.stripe.com",
//           "https://*.mapbox.com",
//           "https://*.cloudflare.com/",
//           "https://bundle.js:*",
//           "https://js.stripe.com",
//           "wss://*.stripe.com",
//           "ws://localhost:*/",
//           ...connectSrcUrls,
//         ],
//         upgradeInsecureRequests: [],
//       },
//     },
//   })
// );

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", "data:", "blob:", "https:", "ws:"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", "https:", "data:", ...fontSrcUrls],
        scriptSrc: [
          "'self'",
          "https:",
          "http:",
          "blob:",
          "https://*.mapbox.com",
          "https://js.stripe.com",
          "https://m.stripe.network",
          "https://*.cloudflare.com",
          "https://js.stripe.com/v3",
          "https://*.stripe.com",
          "'unsafe-eval'", // If you need eval support
          ...scriptSrcUrls,
        ],
        frameSrc: [
          "self",
          "unsafe-inline",
          "data:",
          "blob:",
          "https://*.stripe.com",
          "https://*.mapbox.com",
          "https://*.cloudflare.com/",
          "https://bundle.js:*",
          "https://js.stripe.com",
          "https://js.stripe.com/v3",
          "wss://*.stripe.com", // Allow WebSocket connections for Stripe
          "ws://localhost:*/", // If testing locally
        ],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", "https:", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://*.tiles.mapbox.com",
          "https://api.mapbox.com",
          "https://events.mapbox.com",
          "https://m.stripe.network",
          "https://*.stripe.com",
          "https://js.stripe.com",
        ],
        childSrc: ["'self'", "blob:"],
        imgSrc: ["'self'", "data:", "blob:", ...imageScriptUrls],
        formAction: ["'self'"],
        connectSrc: [
          "'self'",
          "'unsafe-inline'",
          "data:",
          "blob:",
          "https://*.stripe.com",
          "https://api.stripe.com", // Add this for API calls
          "wss://*.stripe.com", // Allow WebSocket connections for Stripe
          "wss://127.0.0.1:*/", // Local testing support
          "https://*.mapbox.com",
          "https://*.cloudflare.com/",
          "https://bundle.js:*",
          "https://js.stripe.com",
          "ws://127.0.0.1:*/",
          ...connectSrcUrls,
        ],
        upgradeInsecureRequests: [],
      },
    },
  })
);

// Development logging
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Limit requests to API
const limiter = rateLimit({
  max: 50,
  windowMs: 10 * 60 * 1000,
  message: "Too many requests, try again later",
});

app.use("/api", limiter);

// Body parser, reading data from the body into req.body
app.use(
  express.json({
    limit: "10kb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  })
);
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter polution
app.use(
  hpp({
    whitelist: [
      "duration",
      "difficulty",
      "maxGroupSize",
      "ratingsQuantity",
      "ratingAverage",
      "price",
    ],
  })
);

app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);

app.all("*", (req, res, next) => {
  // res
  //   .status(404)
  //   .json({ status: "fail", message: `Cant find ${req.originalUrl}` });
  // next();

  // const err = new Error(`Cant find ${req.originalUrl}`);
  // err.status = "fail";
  // err.statusCode = 404;

  next(new AppError(`Cant find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
