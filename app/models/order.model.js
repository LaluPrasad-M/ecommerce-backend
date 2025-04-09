"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { transformResponse } = require("../utils/mongoose.util");

const orderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  name: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  }
});

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: ["Order Placed", "Packed", "Shipping", "Delivered", "Cancelled"],
      default: "Order Placed"
    },
    coupon: {
      type: Schema.Types.ObjectId,
      ref: "Coupon"
    },
    subtotal: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    shippingAddress: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
    toJSON: transformResponse,
    toObject: transformResponse
  }
);

// Create indexes for efficient queries
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ coupon: 1 }, { sparse: true });

module.exports = mongoose.model("Order", orderSchema); 