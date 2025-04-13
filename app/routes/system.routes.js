"use strict";
const express = require("express");
const router = express.Router();
const systemController = require("../controllers/system.controller");

// Root route
router.get('/', systemController.getRoot);

// Health check route
router.get('/healthCheck', systemController.getHealthCheck);

module.exports = router; 