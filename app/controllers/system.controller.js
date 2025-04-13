"use strict";

/**
 * Root route handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRoot = (req, res) => {
  res.status(200).json({
    success: true,
    message: "eCommerce API is running",
  });
};

/**
 * Health check route handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getHealthCheck = (req, res) => {
  res.status(200).json({
    success: true,
    message: "eCommerce API is healthy",
    timestamp: new Date().toISOString(),
  });
};
