import { NextFunction, Request, Response } from 'express';


/**
 * Check if the API key is valid
 */
export function checkApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.header('x-api-key');
  if (apiKey !== process.env.API_KEY) {
    res.status(401);
    const error = new Error('Invalid API Key');
    next(error);
  } else {
    next();
  }
    
}
export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response
) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    // stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
}
