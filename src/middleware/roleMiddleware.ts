import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";
import { AuthRequest } from "./authMiddleware";

export const requireRole = (role: "admin") => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      return next(new AppError("Not authorized", 401));
    }

    if (authReq.user.role !== role) {
      return next(new AppError("Forbidden: insufficient role", 403));
    }

    return next();
  };
};

