"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { transformResponse } = require("../utils/mongoose.util");

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    minimumCartValue: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    usageCount: {
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

// Validate that end date is after start date
couponSchema.pre('validate', function(next) {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
  next();
});

// Create indexes for efficient queries
couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
couponSchema.index({ usageCount: 1 });

module.exports = mongoose.model("Coupon", couponSchema); 