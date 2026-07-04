import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  code?: number; // mongo duplicate key error code
}

export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('💥 Backend Error Captured:', err);

  const statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected error occurred on the server';

  // Handle mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0] || 'field';
    return res.status(400).json({
      message: `A record with this ${field} already exists.`,
      error: 'DuplicateKeyError'
    });
  }

  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    const validationErrors = Object.values((err as any).errors).map((e: any) => e.message);
    return res.status(400).json({
      message: 'Validation failed',
      errors: validationErrors,
      error: 'ValidationError'
    });
  }

  // Handle jsonwebtoken errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Authentication token is invalid',
      error: 'UnauthorizedError'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Authentication token has expired',
      error: 'UnauthorizedError'
    });
  }

  res.status(statusCode).json({
    message,
    error: err.name || 'InternalServerError',
    // stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
}
