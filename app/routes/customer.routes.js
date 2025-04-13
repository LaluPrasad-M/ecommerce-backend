"use strict";
const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller");
const productController = require("../controllers/product.controller");
const cartController = require("../controllers/cart.controller");
const orderController = require("../controllers/order.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Authentication routes
router.post("/register", customerController.register);
router.post("/login", customerController.login);

// Profile routes (protected)
router.get("/profile", authMiddleware.verifyToken, authMiddleware.isCustomer, customerController.getProfile);
router.put("/profile", authMiddleware.verifyToken, authMiddleware.isCustomer, customerController.updateProfile);

// Product routes
router.get("/products", productController.getAllProducts);
router.get("/products/:id", productController.getProductDetails);
router.get("/categories", productController.getCategories);

// Cart routes (protected)
router.get("/cart", authMiddleware.verifyToken, authMiddleware.isCustomer, cartController.getCart);
router.post("/cart", authMiddleware.verifyToken, authMiddleware.isCustomer, cartController.addItem);
router.put("/cart", authMiddleware.verifyToken, authMiddleware.isCustomer, cartController.updateItem);
router.post("/cart/coupon", authMiddleware.verifyToken, authMiddleware.isCustomer, cartController.applyCoupon);
router.delete("/cart/coupon", authMiddleware.verifyToken, authMiddleware.isCustomer, cartController.removeCoupon);
router.delete("/cart/:productId", authMiddleware.verifyToken, authMiddleware.isCustomer, cartController.removeItem);

// Order routes (protected)
router.post("/orders", authMiddleware.verifyToken, authMiddleware.isCustomer, orderController.placeOrder);
router.get("/orders", authMiddleware.verifyToken, authMiddleware.isCustomer, orderController.getOrderHistory);
router.get("/orders/:id", authMiddleware.verifyToken, authMiddleware.isCustomer, orderController.getOrderDetails);
router.put("/orders/:id/cancel", authMiddleware.verifyToken, authMiddleware.isCustomer, orderController.cancelOrder);

// Customer root route
router.get('/', customerController.getRoot);

module.exports = router;