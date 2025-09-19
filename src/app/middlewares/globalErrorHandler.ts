/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import { TErrorSources } from "../interfaces/error.types";
import { handleDuplicateError } from "../helpers/handleDuplicateError";
import { handleCastError } from "../helpers/handleCastError";
import { handleZodError } from "../helpers/handleZodError";
import { handleValidationError } from "../helpers/handleValidationError";
import AppError from "../helpers/AppError";


export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (envVars.NODE_ENV !== "development") {
    console.log(err);
  }

  let statusCode = 500;
  let message = `Something went wrong!!`;
  let errorSources: TErrorSources[] = [];

  if (err.code === 11000) {
    const duplicateErr = handleDuplicateError(err);
    statusCode = duplicateErr.statusCode;
    message = duplicateErr.message;
  } else if (err.name === "CastError") {
    const castErr = handleCastError(err);
    statusCode = castErr.statusCode;
    message = castErr.message;
  } else if (err.name === "ZodError") {
    const zodErr = handleZodError(err);
    statusCode = zodErr.statusCode;
    message = zodErr.message;
    errorSources = zodErr.errorSources;
  } else if (err.name === "ValidationError") {
    const validationErr = handleValidationError(err);
    statusCode = validationErr.statusCode;
    message = validationErr.message;
    errorSources = validationErr.errorSources;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    statusCode = 500;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err: envVars.NODE_ENV === "development" ? err.err : null,
    stack: envVars.NODE_ENV === "development" ? err.stack : null,
  });
};
