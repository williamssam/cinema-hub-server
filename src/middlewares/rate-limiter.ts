import type { Request } from "express";
import { rateLimit } from "express-rate-limit";
import { config } from "../config/configuration";

export const rateLimiter = rateLimit({
  legacyHeaders: true,
  limit: config.RATE_LIMIT_WINDOW_MS,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  windowMs: 15 * 60 * config.RATE_LIMIT_WINDOW_MS,
  keyGenerator: (req: Request) => req.ip as string,
});
