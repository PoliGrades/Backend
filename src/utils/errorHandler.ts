import { NextFunction, Request, Response } from "express";

export interface ErrorWithStatus extends Error {
  statusCode?: number;
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error("Error occurred:", error);

  if (error instanceof Error) {
    const statusCode = (error as ErrorWithStatus).statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      ...(Deno.env.get("ENVIRONMENT") === "development" &&
        { stack: error.stack }),
    });
  } else {
    res.status(500).json({ error: "An unknown error occurred" });
  }
}

export function asyncHandler(
  fn: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void | Response>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function createError(
  message: string,
  statusCode: number = 500,
): ErrorWithStatus {
  const error: ErrorWithStatus = new Error(message);
  error.statusCode = statusCode;
  return error;
}
