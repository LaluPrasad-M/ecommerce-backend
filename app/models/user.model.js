"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { transformResponse } = require("../utils/mongoose.util");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true
    },
    mobileNumber: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: props => `${props.value} is not a valid mobile number!`
      }
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return v === "" || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: props => `${props.value} is not a valid email address!`
      }
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer"
    },
    orders: [{
      type: Schema.Types.ObjectId,
      ref: "Order"
    }]
  },
  {
    timestamps: true,
    toJSON: transformResponse,
    toObject: transformResponse
  }
);

// Create indexes for efficient queries
userSchema.index({ mobileNumber: 1, role: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
