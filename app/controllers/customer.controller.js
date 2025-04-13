"use strict";

const User = require("../models/user.model");
const Cart = require("../models/cart.model");
const auth = require("../../config/authentication");

/**
 * Register a new customer
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - Customer's name
 * @param {string} req.body.address - Customer's address
 * @param {string} req.body.mobileNumber - Customer's mobile number
 * @param {string} req.body.dateOfBirth - Customer's date of birth
 * @param {string} req.body.email - Customer's email address
 * @param {string} req.body.password - Customer's password
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.register = async (req, res, next) => {
  try {
    const { name, address, mobileNumber, dateOfBirth, email, password } = req.body;

    // Check if user with mobile number already exists
    const existingUser = await User.findOne({ mobileNumber, role: "customer" });
    if (existingUser) {
      const error = new Error("User with this mobile number already exists");
      error.status = 400;
      return next(error);
    }

    // Password validation (strong password)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d\W_]{8,}$/;
    if (!passwordRegex.test(password)) {
      const error = new Error("Password must be at least 8 characters long and include uppercase, lowercase, numbers and special characters");
      error.status = 400;
      return next(error);
    }

    // Hash password
    const salt = await auth.genSalt(10);
    const hashedPassword = await auth.hash(salt, password);

    // Create new user
    const user = new User({
      name,
      address,
      mobileNumber,
      dateOfBirth,
      email,
      password: hashedPassword,
      role: "customer"
    });

    await user.save();

    // Create empty cart for user
    const cart = new Cart({
      user: user._id,
      items: []
    });

    await cart.save();
    // Generate token
    const token = await auth.generateSessionToken(
      password,
      user.password,
      { userId: user._id, role: user.role }
    );

    if (!token) {
      const error = new Error("Invalid mobile number or password");
      error.status = 401;
      return next(error);
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        mobileNumber: user.mobileNumber,
        email: user.email,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login customer
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.mobileNumber - Customer's mobile number
 * @param {string} req.body.password - Customer's password
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.login = async (req, res, next) => {
  try {
    const { mobileNumber, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ mobileNumber });
    if (!user) {
      const error = new Error("Invalid mobile number or password");
      error.status = 401;
      return next(error);
    }

    // Check if user is customer
    if (user.role !== "customer") {
      const error = new Error("Invalid credentials");
      error.status = 401;
      return next(error);
    }

    // Generate token
    const token = await auth.generateSessionToken(
      password,
      user.password,
      { userId: user._id, role: user.role }
    );

    if (!token) {
      const error = new Error("Invalid mobile number or password");
      error.status = 401;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        mobileNumber: user.mobileNumber,
        email: user.email,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get customer profile
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user info from auth middleware
 * @param {string} req.user.userId - User ID from token
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update customer profile
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user info from auth middleware
 * @param {string} req.user.userId - User ID from token
 * @param {Object} req.body - Request body
 * @param {string} [req.body.name] - Customer's name
 * @param {string} [req.body.address] - Customer's address
 * @param {string} [req.body.dateOfBirth] - Customer's date of birth
 * @param {string} [req.body.email] - Customer's email address
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, address, dateOfBirth, email } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    // Update fields
    user.name = name || user.name;
    user.address = address || user.address;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;
    user.email = email || user.email;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        mobileNumber: user.mobileNumber,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle customer root route
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRoot = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Customer API is working'
  });
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getRoot
}; 