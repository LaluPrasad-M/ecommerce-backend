"use strict";

const bcrypt = require("bcryptjs");
const User = require('../models/user.model');

/**
 * Check if admin exists, if not create a default admin user
 */
exports.createAdminIfNotExists = async () => {
    try {
        // Check if admin already exists
        const adminExists = await User.findOne({ role: "admin" });
        if (adminExists) {
            console.log("Admin user already exists.");
            return;
        }

        // Create admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("Admin@123", salt);

        const admin = new User({
            name: "Admin",
            address: "Admin Office",
            mobileNumber: "9999999999",
            dateOfBirth: new Date("1990-01-01"),
            email: "admin@example.com",
            password: hashedPassword,
            role: "admin"
        });

        await admin.save();
        console.log("Admin user created automatically!");
        console.log("Mobile Number: 9999999999");
        console.log("Password: Admin@123");
    } catch (error) {
        console.error(`Error creating admin user: ${error.message}`);
    }
}; 