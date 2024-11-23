import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../utils/httpStatus";

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  const errorMsg = error.message || "An unexpected error occurred";
  let statusCode = HttpStatus.INTERNAL_SERVER_ERROR; 


  if (errorMsg.includes("Email does not exist")) {
    statusCode = HttpStatus.NOT_FOUND;
  } else if (errorMsg.includes("Incorrect password")) {
    statusCode = HttpStatus.UNAUTHORIZED;
  } else if (errorMsg.includes("E11000") || errorMsg.includes("duplicate key error")) {
    statusCode = HttpStatus.CONFLICT; 
  } else if (errorMsg.includes("ValidationError")) {
    statusCode = HttpStatus.BAD_REQUEST;
  }

  console.error("Error:", {
    message: errorMsg,
    stack: error.stack,
  });

  res.status(statusCode).json({
    success: false,
    statusCode,
    message: errorMsg,
  });
};
