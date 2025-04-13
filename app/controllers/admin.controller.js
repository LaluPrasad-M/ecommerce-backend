"use strict";

const User = require("../models/user.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const Coupon = require("../models/coupon.model");
const auth = require("../../config/authentication");

/**
 * Admin login
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.mobileNumber - Admin's mobile number
 * @param {string} req.body.password - Admin's password
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.login = async (req, res, next) => {
  try {
    const { mobileNumber, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ mobileNumber });
    if (!user) {
      const error = new Error("Invalid credentials");
      error.status = 401;
      return next(error);
    }

    // Check if user is admin
    if (user.role !== "admin") {
      const error = new Error("Unauthorized access");
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
      const error = new Error("Invalid credentials");
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
 * Add a new product
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - Product name
 * @param {string} req.body.description - Product description
 * @param {number} req.body.price - Product price
 * @param {number} req.body.stock - Product stock quantity
 * @param {string} req.body.category - Product category
 * @param {string} req.body.image - Product image URL
 * @param {boolean} req.body.isActive - Product active status
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.addProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category, image, isActive } = req.body;

    const product = new Product({
      name,
      description,
      price,
      stock,
      category,
      image,
      isActive
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing product
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request path parameters
 * @param {string} req.params.id - Product ID
 * @param {Object} req.body - Request body
 * @param {string} [req.body.name] - Product name
 * @param {string} [req.body.description] - Product description
 * @param {number} [req.body.price] - Product price
 * @param {number} [req.body.stock] - Product stock quantity
 * @param {string} [req.body.category] - Product category
 * @param {string} [req.body.image] - Product image URL
 * @param {boolean} [req.body.isActive] - Product active status
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category, image, isActive } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      const error = new Error("Product not found");
      error.status = 404;
      return next(error);
    }

    // Update fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.stock = stock ?? product.stock;
    product.category = category || product.category;
    product.image = image || product.image;
    product.isActive = isActive ?? product.isActive;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a product
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request path parameters
 * @param {string} req.params.id - Product ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      const error = new Error("Product not found");
      error.status = 404;
      return next(error);
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all products
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find({});

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name mobileNumber")
      .populate("items.product", "name image");

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request path parameters
 * @param {string} req.params.id - Order ID
 * @param {Object} req.body - Request body
 * @param {string} req.body.status - New order status
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      const error = new Error("Order not found");
      error.status = 404;
      return next(error);
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new coupon
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.code - Coupon code
 * @param {number} req.body.discountPercentage - Discount percentage (0-100)
 * @param {number} req.body.minimumCartValue - Minimum cart value for coupon to apply
 * @param {Date} req.body.startDate - Coupon validity start date
 * @param {Date} req.body.endDate - Coupon validity end date
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.createCoupon = async (req, res, next) => {
  try {
    const { code, discountPercentage, minimumCartValue, startDate, endDate } = req.body;

    // Validate discount percentage
    if (discountPercentage < 0 || discountPercentage > 100) {
      const error = new Error("Discount percentage must be between 0 and 100");
      error.status = 400;
      return next(error);
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      const error = new Error("Coupon code already exists");
      error.status = 400;
      return next(error);
    }

    const coupon = new Coupon({
      code,
      discountPercentage,
      minimumCartValue,
      startDate,
      endDate
    });

    await coupon.save();

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing coupon
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request path parameters
 * @param {string} req.params.id - Coupon ID
 * @param {Object} req.body - Request body
 * @param {number} [req.body.discountPercentage] - Discount percentage (0-100)
 * @param {number} [req.body.minimumCartValue] - Minimum cart value for coupon to apply
 * @param {Date} [req.body.startDate] - Coupon validity start date
 * @param {Date} [req.body.endDate] - Coupon validity end date
 * @param {boolean} [req.body.isActive] - Coupon active status
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { discountPercentage, minimumCartValue, startDate, endDate, isActive } = req.body;

    // Validate discount percentage if provided
    if (discountPercentage !== undefined && (discountPercentage < 0 || discountPercentage > 100)) {
      const error = new Error("Discount percentage must be between 0 and 100");
      error.status = 400;
      return next(error);
    }

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      const error = new Error("Coupon not found");
      error.status = 404;
      return next(error);
    }

    // Update fields
    coupon.discountPercentage = discountPercentage || coupon.discountPercentage;
    coupon.minimumCartValue = minimumCartValue || coupon.minimumCartValue;
    coupon.startDate = startDate || coupon.startDate;
    coupon.endDate = endDate || coupon.endDate;
    coupon.isActive = isActive !== undefined ? isActive : coupon.isActive;

    await coupon.save();

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a coupon
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request path parameters
 * @param {string} req.params.id - Coupon ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      const error = new Error("Coupon not found");
      error.status = 404;
      return next(error);
    }

    await Coupon.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all coupons
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({});

    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard metrics for admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getDashboardMetrics = async (req, res, next) => {
  try {
    // Total orders count
    const totalOrders = await Order.countDocuments();
    
    // Total products in inventory
    const productsInInventory = await Product.countDocuments();
    
    // Total products sold
    const productsSoldMetrics = await Order.aggregate([
      // Exclude cancelled orders
      { $match: { status: { $ne: "Cancelled" } } },
      // Unwind to work with individual items
      { $unwind: "$items" },
      // Sum all quantities
      { $group: { _id: null, totalSold: { $sum: "$items.quantity" } } }
    ]);
    
    const totalItemsSold = productsSoldMetrics.length > 0 ? productsSoldMetrics[0].totalSold : 0;
    
    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    // Total sales
    const salesMetrics = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $group: { _id: null, totalSales: { $sum: "$total" } } }
    ]);
    
    // Low stock products (less than 10 items)
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });
    
    // Coupon usage
    const couponUsage = await Order.countDocuments({ coupon: { $ne: null } });
    
    // Total customers
    const totalCustomers = await User.countDocuments({ role: "customer" });
    
    res.status(200).json({
      success: true,
      metrics: {
        totalOrders,
        productsInInventory,
        totalItemsSold,
        ordersByStatus,
        totalSales: salesMetrics.length > 0 ? salesMetrics[0].totalSales : 0,
        lowStockProducts,
        couponUsage,
        totalCustomers
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle admin root route
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRoot = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin API is working'
  });
};