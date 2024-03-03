import { ErrorRequestHandler, NextFunction, Response } from "express";
import ApiError from "../utils/ApiError";
import { ApiRequest } from "./auth.type";

export interface ApiErrorRequestHandler extends ErrorRequestHandler {
  (err: ApiError, req: ApiRequest, res: Response, next: NextFunction): void;
}
