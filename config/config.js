"use strict";

require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI,
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_KEY: process.env.JWT_KEY || "secret"
}; 