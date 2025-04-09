"use strict";

const Product = require("../models/product.model");

// Get all products
exports.getAllProducts = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice } = req.query;
    
    // Build filter object
    const filter = { isActive: true, stock: { $gt: 0 } };
    
    // Apply category filter
    if (category) {
      filter.category = category;
    }
    
    // Apply price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    const products = await Product.find(filter).select("name description price stock category image");
    
    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

// Get product details
exports.getProductDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findOne({ _id: id, isActive: true });
    
    if (!product) {
      const error = new Error("Product not found");
      error.status = 404;
      return next(error);
    }
    
    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

// Get product categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct("category", { isActive: true });
    
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
}; 