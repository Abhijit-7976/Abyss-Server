import { NextFunction, Response } from "express";
import { ApiRequest, ApiRequestHandler } from "../types/auth.type.js";

const catchAsync = (cb: ApiRequestHandler) => {
  return (req: ApiRequest, res: Response, next: NextFunction) => {
    Promise.resolve(cb(req, res, next)).catch(err => next(err));
  };
};

export default catchAsync;
