"use strict";

/**
 * Transform function for Mongoose schema to clean the response object
 * - Converts _id to id
 * - Removes __v, createdAt, updatedAt
 */
exports.transformResponse = {
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt;
    return ret;
  },
  virtuals: true,
  versionKey: false,
  getters: true
}; 