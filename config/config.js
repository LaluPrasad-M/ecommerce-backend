"use strict";

require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_KEY: process.env.JWT_KEY || "secret"
}; 