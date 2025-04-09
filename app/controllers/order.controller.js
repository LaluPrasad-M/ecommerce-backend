"use strict";

const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");
const Coupon = require("../models/coupon.model");

// Place a new order
exports.placeOrder = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) {
      const error = new Error("Cart not found");
      error.status = 404;
      return next(error);
    }

    if (cart.items.length === 0) {
      const error = new Error("Cart is empty");
      error.status = 400;
      return next(error);
    }

    // Check if all products are in stock
    for (const item of cart.items) {
      const product = item.product;
      if (product.stock < item.quantity) {
        const error = new Error(`Only ${product.stock} units of ${product.name} available in stock`);
        error.status = 400;
        return next(error);
      }
    }

    // Get user for address
    const user = await User.findById(userId);

    // Create order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.price
    }));

    // Create new order
    const order = new Order({
      user: userId,
      items: orderItems,
      coupon: cart.coupon,
      subtotal: cart.subtotal,
      discount: cart.discount,
      tax: cart.tax,
      total: cart.total,
      shippingAddress: user.address
    });

    await order.save();

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Update coupon usage if used
    if (cart.coupon) {
      await Coupon.findByIdAndUpdate(
        cart.coupon,
        { $inc: { usageCount: 1 } }
      );
    }

    // Add order to user's orders
    await User.findByIdAndUpdate(
      userId,
      { $push: { orders: order._id } }
    );

    // Clear cart
    cart.items = [];
    cart.coupon = null;
    cart.subtotal = 0;
    cart.discount = 0;
    cart.tax = 0;
    cart.total = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order
    });
  } catch (error) {
    next(error);
  }
};

// Get order history
exports.getOrderHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("items.product", "name image")
      .populate("coupon", "code discountPercentage");

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// Get order details
exports.getOrderDetails = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, user: userId })
      .populate("items.product", "name price image")
      .populate("coupon", "code discountPercentage");

    if (!order) {
      const error = new Error("Order not found");
      error.status = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// Cancel order
exports.cancelOrder = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, user: userId });
    if (!order) {
      const error = new Error("Order not found");
      error.status = 404;
      return next(error);
    }

    // Check if order is already delivered
    if (order.status === "Delivered") {
      const error = new Error("Delivered orders cannot be cancelled");
      error.status = 400;
      return next(error);
    }

    // Cancel order
    order.status = "Cancelled";
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order
    });
  } catch (error) {
    next(error);
  }
}; 