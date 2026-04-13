import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    const token = header.slice(7);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      (req as any).user = decoded;
    } catch {
    }
  }
  next();
}
