import { Response, NextFunction } from "express";
import { HTTPClientError, HTTP404Error } from "../utils/httpErrors";
import config from "../config";
export const notFoundError = () => {
  throw new HTTP404Error("Method not found.");
};

export const clientError = (err: Error, res: Response, next: NextFunction) => {
  if (err instanceof HTTPClientError) {
    // console.warn(err);
    // add logging service
    res.status(err.statusCode).send(err.message);
  } else {
    next(err);
  }
};

export const serverError = (err: Error, res: Response, _next: NextFunction) => {
  // console.error(err);
  // add error logging service
  return res.status(500).send(err.stack);
};