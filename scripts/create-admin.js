"use strict";

const mongoose = require("mongoose");
const config = require("../config/config");
const adminUtil = require("../app/utils/admin.util");

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("MongoDB connected...");
    
    // Use the utility function to create admin if not exists
    await adminUtil.createAdminIfNotExists();
    
    // Disconnect and exit
    mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }); 