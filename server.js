const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });

process.on("uncaughtException", (error) => {
  console.error("UNHANDLED EXCEPTION");
  console.log(error.name);
  console.log(error.message);
  process.exit(1);
});

const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<password>",
  // eslint-disable-next-line prettier/prettier
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("DB connection successful");
  });
// .catch(() => console.log("There was an error connecting to database"));

// Starting up a server
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () =>
  console.log(`App running on port ${PORT}`)
);

process.on("unhandledRejection", (error) => {
  console.error("UNHANDLED REJECTION");
  console.log(error.name);
  console.log(error.message);
  server.close(() => {
    process.exit(1);
  });
});
