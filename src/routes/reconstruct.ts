import { Router, Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/errorHandler";
import { protect, AuthRequest } from "../middleware/authMiddleware";
import ReconstructJob from "../models/ReconstructJob";
import { layoutStore } from "../services/layoutStore";
import type { CanonicalScene } from "../types/scene";

const router = Router();

// POST /api/reconstruct - create a reconstruction job
router.post(
  "/",
  protect,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        throw new AppError("Not authorized", 401);
      }

      const { imageUrl } = req.body;
      if (imageUrl && typeof imageUrl !== "string") {
        throw new AppError("imageUrl must be a string if provided", 400);
      }

      const job = await ReconstructJob.create({
        userId: authReq.user.id,
        imageUrl,
        status: "completed",
        scene: {
          schemaVersion: "1.0",
          units: "meters",
          room: {
            width: 4,
            depth: 4,
            height: 3,
            wallVisible: true,
            floorColor: "#1a1a1a",
          },
          objects: [],
          metadata: {
            source: "stubbed",
          },
        } as CanonicalScene,
      });

      res.status(201).json({
        success: true,
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/reconstruct/:id - get job status and result
router.get(
  "/:id",
  protect,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        throw new AppError("Not authorized", 401);
      }

      const { id } = req.params;
      const job = await ReconstructJob.findById(id);

      if (!job) {
        throw new AppError("Job not found", 404);
      }

      if (job.userId !== authReq.user.id) {
        throw new AppError("Not authorized to view this job", 403);
      }

      res.json({
        success: true,
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/reconstruct/:id/accept - turn result into a layout
router.post(
  "/:id/accept",
  protect,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        throw new AppError("Not authorized", 401);
      }

      const { id } = req.params;
      const { name } = req.body as { name?: string };

      const job = await ReconstructJob.findById(id);

      if (!job) {
        throw new AppError("Job not found", 404);
      }

      if (job.userId !== authReq.user.id) {
        throw new AppError("Not authorized to accept this job", 403);
      }

      if (job.status !== "completed" || !job.scene) {
        throw new AppError("Job is not completed yet", 400);
      }

      const layoutName =
        typeof name === "string" && name.trim().length > 0
          ? name.trim()
          : "Imported room layout";

      const layout = await layoutStore.create({
        name: layoutName,
        objects: [],
        userId: authReq.user.id,
        isPublic: false,
        scene: job.scene,
        provenance: {
          originalLayoutId: undefined,
          originalOwnerId: authReq.user.id,
          source: "reconstruct",
          jobId: job.id,
        },
      });

      res.status(201).json({
        success: true,
        data: layout,
        message: "Layout created from reconstruction job",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

