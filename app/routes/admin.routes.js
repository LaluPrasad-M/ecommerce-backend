"use strict";
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Authentication routes
router.post("/login", adminController.login);

// Product management routes (protected)
router.get("/products", authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.getAllProducts);
router.post("/products", authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.addProduct);
router.put("/products/:id", authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.updateProduct);
router.delete("/products/:id", authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.deleteProduct);

// Order management routes (protected)
router.get("/orders", authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.getAllOrders);
router.put("/orders/:id/status", authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.updateOrderStatus);

// Coupon management routes (protected)
router.get("/coupons", authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.getAllCoupons);
router.post("/coupons", authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.createCoupon);
router.put("/coupons/:id", authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.updateCoupon);
router.delete("/coupons/:id", authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.deleteCoupon);

// Dashboard
router.get("/dashboard", authMiddleware.verifyToken, authMiddleware.isAdmin, adminController.getDashboardMetrics);

// Admin root route
router.get('/', adminController.getRoot);

module.exports = router;