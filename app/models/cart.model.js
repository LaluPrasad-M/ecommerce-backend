"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { transformResponse } = require("../utils/mongoose.util");

const cartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true
  }
});

const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: [cartItemSchema],
    coupon: {
      type: Schema.Types.ObjectId,
      ref: "Coupon"
    },
    subtotal: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: transformResponse,
    toObject: transformResponse
  }
);

// Create indexes for efficient queries
cartSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model("Cart", cartSchema); 