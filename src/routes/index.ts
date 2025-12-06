import { Router, Request, Response } from "express";
import layoutRoutes from "./layouts";
// import authRoutes from './auth';

const router = Router();

// Mount route modules
router.use("/layouts", layoutRoutes);
// router.use('/auth', authRoutes);

// API info endpoint
router.get("/", (req: Request, res: Response) => {
  res.json({
    message: "My Setup API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      api: "/api",
      layouts: "/api/layouts",
    },
  });
});

export default router;
