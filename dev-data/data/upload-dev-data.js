const fs = require("fs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Tour = require("../../models/tourModel");
const User = require("../../models/userModel");
const Review = require("../../models/reviewModel");

dotenv.config({ path: "./config.env" });

const app = require("../../app");

const DB = process.env.DATABASE.replace(
  "<password>",
  // eslint-disable-next-line prettier/prettier
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("DB connection successful");
  });

// Starting up a server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`App running on port ${PORT}`));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, "utf-8")
);

async function importData() {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log("Data imported");
    process.exit();
  } catch (err) {
    console.log(err);
    console.log("There was an error importing data");
  }
}

async function deleteData() {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data deleted");
    process.exit();
  } catch (err) {
    console.log("There was an error deleting data");
  }
}

console.log(process.argv);

if (process.argv[2] === "--upload") importData();
if (process.argv[2] === "--delete") deleteData();
