import { NextFunction, Response } from "express";
import { Model } from "mongoose";
import { ApiRequest } from "../types/auth.type.js";
import AppError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import catchAsync from "../utils/catchAsync.js";

export const findAll = (Model: Model<any, any, any>) => {
  return catchAsync(
    async (req: ApiRequest, res: Response, next: NextFunction) => {
      const doc = await Model.find();
      res.status(200).json(new ApiResponse(200, { doc }, "Doc created"));
    }
  );
};

export const findOne = (Model: Model<any, any, any>) => {
  return catchAsync(async (req: ApiRequest, res, next) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) throw new AppError("No document found with that ID", 404);

    res.status(200).json(new ApiResponse(200, { doc }, "Doc found"));
  });
};

export const UpdateOne = (Model: Model<any, any, any>) => {
  return catchAsync(
    async (req: ApiRequest, res: Response, next: NextFunction) => {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!doc) throw new AppError("No document found with that ID", 404);

      res.status(200).json(new ApiResponse(200, { doc }, "Doc updated"));
    }
  );
};

export const deleteOne = (Model: Model<any, any, any>) => {
  return catchAsync(
    async (req: ApiRequest, res: Response, next: NextFunction) => {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) throw new AppError("No document found with that ID", 404);

      res.status(204).json(new ApiResponse(204, null, "Doc deleted"));
    }
  );
};
