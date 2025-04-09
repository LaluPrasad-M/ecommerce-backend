"use strict";

const express = require("express");
const cors = require("cors");

exports.config = (app) => {
  //Preventing CORS errors
  //to Run Client and Server on different Systems
  app.use(cors())
  app.use((req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, PATCH");
      return res.status(200).json({});
    }
    next();
  });

  //parse the incoming request bodies in a middleware before your handlers, available under the req.body property.
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
};

exports.ErrorHandler = (app) => {
  //Handling Errors
  app.use((req, res, next) => {
    const error = new Error("Url Not Found! Invalid URL!");
    error.status = 404;
    next(error);
  });

  app.use((error, req, res, next) => {
    console.error(error.message || error)

    res.status(error.status || 500);
    res.json({
      status: error.status || 500,
      success: false,
      message: error.message,
    });
  });
};