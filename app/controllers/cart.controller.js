"use strict";

const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const Coupon = require("../models/coupon.model");

const TAX_RATE = 0.18; // 18% GST

// Get cart items
exports.getCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    let cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        select: "name price image stock"
      })
      .populate({
        path: "coupon",
        select: "code discountPercentage"
      });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
      await cart.save();
    }

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
};

// Add item to cart
exports.addItem = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;

    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("Product not found");
      error.status = 404;
      return next(error);
    }

    if (!product.isActive) {
      const error = new Error("Product is not available");
      error.status = 400;
      return next(error);
    }

    // Check stock
    if (product.stock < quantity) {
      const error = new Error(`Only ${product.stock} units available in stock`);
      error.status = 400;
      return next(error);
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex !== -1) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].price = product.price;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price
      });
    }

    // Calculate totals
    await updateCartTotals(cart);

    await cart.save();

    // Populate product details
    await cart.populate({
      path: "items.product",
      select: "name price image stock"
    });

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart
    });
  } catch (error) {
    next(error);
  }
};

// Update cart item
exports.updateItem = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;

    // Validate quantity
    if (quantity < 0) {
      const error = new Error("Quantity cannot be less than 0");
      error.status = 400;
      return next(error);
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      const error = new Error("Cart not found");
      error.status = 404;
      return next(error);
    }

    // Find the item
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      const error = new Error("Item not found in cart");
      error.status = 404;
      return next(error);
    }

    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("Product not found");
      error.status = 404;
      return next(error);
    }

    // Check stock
    if (quantity > 0 && product.stock < quantity) {
      const error = new Error(`Only ${product.stock} units available in stock`);
      error.status = 400;
      return next(error);
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].price = product.price;
    }

    // Calculate totals
    await updateCartTotals(cart);

    await cart.save();

    // Populate product details
    await cart.populate({
      path: "items.product",
      select: "name price image stock"
    });

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart
    });
  } catch (error) {
    next(error);
  }
};

// Remove item from cart
exports.removeItem = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      const error = new Error("Cart not found");
      error.status = 404;
      return next(error);
    }

    // Find the item
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      const error = new Error("Item not found in cart");
      error.status = 404;
      return next(error);
    }

    // Remove item
    cart.items.splice(itemIndex, 1);

    // Calculate totals
    await updateCartTotals(cart);

    await cart.save();

    // Populate product details
    await cart.populate({
      path: "items.product",
      select: "name price image stock"
    });

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart
    });
  } catch (error) {
    next(error);
  }
};

// Apply coupon
exports.applyCoupon = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { code } = req.body;
    
    if (!code || typeof code !== 'string') {
      const error = new Error("Please provide a valid coupon code");
      error.status = 400;
      return next(error);
    }

    let cart = await Cart.findOne({ user: userId })
      .populate({
        path: "coupon",
        select: "code"
      });
    
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

    // Check if the same coupon is already applied
    if (cart.coupon && cart.coupon.code === code.toUpperCase()) {
      const error = new Error("This coupon is already applied to your cart");
      error.status = 400;
      return next(error);
    }

    // Check if another coupon is already applied
    if (cart.coupon) {
      const error = new Error(`Coupon "${cart.coupon.code}" is already applied to your cart. Please remove it first before applying a new coupon.`);
      error.status = 400;
      return next(error);
    }

    // Find the coupon
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    if (!coupon) {
      const error = new Error("Invalid or expired coupon code");
      error.status = 400;
      return next(error);
    }

    // Check minimum cart value
    if (cart.subtotal < coupon.minimumCartValue) {
      const error = new Error(`Minimum cart value of ₹${coupon.minimumCartValue} required for this coupon`);
      error.status = 400;
      return next(error);
    }

    // Apply coupon
    cart.coupon = coupon._id;
    
    // Calculate totals
    await updateCartTotals(cart);

    await cart.save();

    // Populate coupon details
    await cart.populate({
      path: "coupon",
      select: "code discountPercentage"
    });

    // Populate product details
    await cart.populate({
      path: "items.product",
      select: "name price image stock"
    });

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      cart
    });
  } catch (error) {
    next(error);
  }
};

// Remove coupon
exports.removeCoupon = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      const error = new Error("Cart not found");
      error.status = 404;
      return next(error);
    }

    // Remove coupon
    cart.coupon = null;
    
    // Calculate totals
    await updateCartTotals(cart);

    await cart.save();

    // Populate product details
    await cart.populate({
      path: "items.product",
      select: "name price image stock"
    });

    res.status(200).json({
      success: true,
      message: "Coupon removed successfully",
      cart
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to update cart totals
async function updateCartTotals(cart) {
  // Remove coupon if cart is empty
  if (cart.items.length === 0 && cart.coupon) {
    cart.coupon = null;
    cart.discount = 0;
  }

  // Calculate subtotal
  cart.subtotal = cart.items.reduce(
    (total, item) => total + item.price * item.quantity, 
    0
  );

  // Calculate tax
  cart.tax = cart.subtotal * TAX_RATE;
  
  // Apply discount if coupon exists
  if (cart.coupon) {
    const coupon = await Coupon.findById(cart.coupon);
    if (coupon && coupon.isActive) {
      cart.discount = (cart.subtotal * coupon.discountPercentage) / 100;
    } else {
      cart.coupon = null;
      cart.discount = 0;
    }
  } else {
    cart.discount = 0;
  }
  
  // Calculate total
  cart.total = cart.subtotal + cart.tax - cart.discount;
} 