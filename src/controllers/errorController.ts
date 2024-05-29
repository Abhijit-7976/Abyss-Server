import { ErrorRequestHandler, Request } from "express";
import jwt from "jsonwebtoken";
import { MongoServerError } from "mongodb";
import { Error } from "mongoose";
import ApiError from "../utils/ApiError.js";

const handleDuplicateFields = (err: MongoServerError) => {
  const field = Object.keys(err.keyValue)[0];
  return new ApiError(
    `The ${field} with '${err.keyValue[field]}' is already taken.`,
    400
  );
};

const handleValidationError = (err: Error.ValidationError) => {
  const errors = Object.values(err.errors).map(el => el.message);

  return new ApiError(`Invalid input data. ${errors.join(". ")}!`, 400);
};

const handleJwtError = (err: jwt.JsonWebTokenError) => {
  return new ApiError("Invalid token. Please log in again!", 401);
};

const handleJwtExpireError = (err: jwt.TokenExpiredError) => {
  return new ApiError("Token expired. Please log in again!", 401);
};

const sendErrorDev: ErrorRequestHandler = (err: ApiError, req, res, next) => {
  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode).json({
      ...err,
      message: err.message,
      stack: err.stack,
    });
  }
};

const sendErrorProd: ErrorRequestHandler = (err: ApiError, req, res, next) => {
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        message: err.message,
        status: err.status,
      });
    } else {
      console.log("💣 ERROR \n", err);
      res.status(500).json({
        message: "Something went wrong",
        status: "error",
      });
    }
  }
};

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let error: ApiError = new ApiError(err.message, err.statusCode || 500);
  error.isOperational = err.isOperational || false;

  if (process.env.NODE_ENV?.trim() === "development") {
    console.log("development error");
    console.log(err);
    sendErrorDev(error, req, res, next);
  } else if (process.env.NODE_ENV?.trim() === "production") {
    console.log("production error");
    console.log(err);
    if (err instanceof MongoServerError && err.code === 11000)
      error = handleDuplicateFields(err);
    if (err instanceof Error.ValidationError)
      error = handleValidationError(err);
    if (err instanceof jwt.JsonWebTokenError) error = handleJwtError(err);
    if (err instanceof jwt.TokenExpiredError) error = handleJwtExpireError(err);

    sendErrorProd(error, req, res, next);
  }
};

export default globalErrorHandler;
