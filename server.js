"use strict";

const express = require("express");
const expressManager = require("./config/express");
const db = require("./config/mongo");
const config = require('./config/config');
const adminUtil = require('./app/utils/admin.util');

// Routes
const adminRoutes = require('./app/routes/admin.routes');
const customerRoutes = require('./app/routes/customer.routes');

const app = express();
const PORT = config.PORT;

expressManager.config(app);

app.use('/admin', adminRoutes);
app.use('/customer', customerRoutes);

//expressManager.ErrorHandler should be after all the others routes are gone through
expressManager.ErrorHandler(app);

//initialize a connection with db
db.initDb(async (err) => {
    if (err) {
        console.log(`Error in connecting to the database: ${err}`);
    } else {
        // Create admin if not exists
        await adminUtil.createAdminIfNotExists();
        
        app.listen(PORT, () => {
            console.log(`Server is Running on PORT: ${PORT}`)
        });
    }
})