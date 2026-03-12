import { Router, Request, Response, NextFunction } from "express";
import Collection from "../models/Collection";
import { protect, AuthRequest } from "../middleware/authMiddleware";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// GET /api/collections - get collections for current user
router.get(
  "/",
  protect,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        throw new AppError("Not authorized", 401);
      }

      const collections = await Collection.find({
        ownerId: authReq.user.id,
      }).sort({ createdAt: -1 });

      res.json({ success: true, data: collections });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/collections - create a collection
router.post(
  "/",
  protect,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        throw new AppError("Not authorized", 401);
      }

      const { name, description, isPublic } = req.body as {
        name?: string;
        description?: string;
        isPublic?: boolean;
      };

      if (!name || typeof name !== "string" || name.trim().length === 0) {
        throw new AppError("Collection name is required", 400);
      }

      const collection = await Collection.create({
        name: name.trim(),
        description: description || "",
        ownerId: authReq.user.id,
        isPublic: !!isPublic,
        layoutIds: [],
      });

      res.status(201).json({ success: true, data: collection });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/collections/:id/layouts - add layout to collection
router.post(
  "/:id/layouts",
  protect,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        throw new AppError("Not authorized", 401);
      }

      const { id } = req.params;
      const { layoutId } = req.body as { layoutId?: string };

      if (!layoutId || typeof layoutId !== "string") {
        throw new AppError("layoutId is required", 400);
      }

      const collection = await Collection.findById(id);
      if (!collection) {
        throw new AppError("Collection not found", 404);
      }

      if (collection.ownerId !== authReq.user.id) {
        throw new AppError("Not authorized to modify this collection", 403);
      }

      if (!collection.layoutIds.includes(layoutId)) {
        collection.layoutIds.push(layoutId);
        await collection.save();
      }

      res.json({ success: true, data: collection });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

