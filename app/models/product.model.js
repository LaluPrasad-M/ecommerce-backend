"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { transformResponse } = require("../utils/mongoose.util");

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    category: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: transformResponse,
    toObject: transformResponse
  }
);

// Create indexes for efficient queries
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1, stock: 1 }); // For filtering active products with stock
productSchema.index({ price: 1 });
productSchema.index({ isActive: 1, category: 1, stock: 1 }); // For category filtering with stock check
productSchema.index({ isActive: 1, price: 1, stock: 1 }); // For price range queries with stock check

module.exports = mongoose.model("Product", productSchema); 