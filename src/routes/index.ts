import { Router, Request, Response } from "express";
import layoutRoutes from "./layouts";
import authRoutes from './auth';
import objectRoutes from './objects';
import templateRoutes from './templates';
import customObjectRoutes from './customObjects';
import commentRoutes from './comments';

const router = Router();

// Mount route modules
router.use("/layouts", layoutRoutes);
router.use('/auth', authRoutes);
router.use('/objects', objectRoutes);
router.use('/templates', templateRoutes);
router.use('/custom-objects', customObjectRoutes);
router.use('/comments', commentRoutes);

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
