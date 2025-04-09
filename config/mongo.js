"use strict"

const mongoose = require("mongoose");
const config = require("./config");

const dbURL = config.MONGODB_URI;

const initDb = (callback) => {
  mongoose.connect(dbURL, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("MongoDB connected successfully!");
    callback(null, mongoose.connection);
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    callback(err);
  });

  mongoose.Promise = global.Promise;
};

module.exports = {
  initDb
};

