import { Router, Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/errorHandler";
import { layoutStore } from "../services/layoutStore";
import { WorkspaceObject } from "../types";
import type { CanonicalScene } from "../types/scene";
import LayoutLike from "../models/LayoutLike";
import type { AuthRequest } from "../middleware/authMiddleware";

const router = Router();

// GET /api/layouts/community - Get public layouts
router.get(
  "/community",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const layouts = await layoutStore.getPublic();

      res.json({
        success: true,
        data: layouts,
        message: "Public layouts retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/layouts - Get all layouts
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Optional: filter by userId from query params (for future auth)
    const userId = req.query.userId as string | undefined;
    const layouts = await layoutStore.getAll(userId);

    res.json({
      success: true,
      data: layouts,
      message: "Layouts retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/layouts/:id - Get a specific layout
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const layout = await layoutStore.getById(id);

    if (!layout) {
      throw new AppError("Layout not found", 404);
    }

    res.json({
      success: true,
      data: layout,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/layouts/:id/like - Like/unlike a layout
router.post(
  "/:id/like",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        throw new AppError("Not authorized", 401);
      }

      const { id } = req.params;
      const userId = authReq.user.id;

      const layout = await layoutStore.getById(id);
      if (!layout) {
        throw new AppError("Layout not found", 404);
      }

      const existing = await LayoutLike.findOne({ layoutId: id, userId });

      if (existing) {
        await LayoutLike.deleteOne({ _id: existing.id });
        layout.stats.likes = Math.max(0, (layout.stats.likes || 0) - 1);
      } else {
        await LayoutLike.create({ layoutId: id, userId });
        layout.stats.likes = (layout.stats.likes || 0) + 1;
      }

      await layout.save();

      res.json({
        success: true,
        data: {
          id: layout.id,
          stats: layout.stats,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/layouts - Create a new layout
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, objects, userId, isPublic, scene } = req.body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw new AppError("Layout name is required", 400);
    }

    if (!Array.isArray(objects)) {
      throw new AppError("Objects must be an array", 400);
    }

    // Validate objects structure
    const validObjects: WorkspaceObject[] = objects.map(
      (obj: any, index: number) => {
        if (!obj.id || !obj.type || !obj.name) {
          throw new AppError(
            `Object at index ${index} is missing required fields (id, type, name)`,
            400
          );
        }
        return obj as WorkspaceObject;
      }
    );

    const canonicalScene: CanonicalScene | undefined =
      scene && typeof scene === "object" ? (scene as CanonicalScene) : undefined;

    const layout = await layoutStore.create({
      name: name.trim(),
      objects: validObjects,
      userId,
      isPublic,
      scene: canonicalScene,
    });

    res.status(201).json({
      success: true,
      data: layout,
      message: "Layout created successfully",
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/layouts/:id/remix - Remix a layout into a new one
router.post(
  "/:id/remix",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        throw new AppError("Not authorized", 401);
      }

      const { id } = req.params;
      const source = await layoutStore.getById(id);

      if (!source) {
        throw new AppError("Layout not found", 404);
      }

      const name =
        typeof req.body?.name === "string" && req.body.name.trim().length > 0
          ? req.body.name.trim()
          : `${source.name} (Remix)`;

      const remixed = await layoutStore.create({
        name,
        objects: source.objects,
        userId: authReq.user.id,
        isPublic: false,
        scene: source.scene,
        parentLayoutId: source.id,
        provenance: {
          originalLayoutId: source.id,
          originalOwnerId: source.userId,
        },
      });

      source.stats.remixes = (source.stats.remixes || 0) + 1;
      source.forkCount = (source.forkCount || 0) + 1;
      await source.save();

      res.status(201).json({
        success: true,
        data: remixed,
        message: "Layout remixed successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/layouts/:id - Update a layout
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, objects, isPublic, scene } = req.body;

    const exists = await layoutStore.exists(id);
    if (!exists) {
      throw new AppError("Layout not found", 404);
    }

    const updates: {
      name?: string;
      objects?: WorkspaceObject[];
      isPublic?: boolean;
      scene?: CanonicalScene;
    } = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        throw new AppError("Layout name must be a non-empty string", 400);
      }
      updates.name = name.trim();
    }

    if (objects !== undefined) {
      if (!Array.isArray(objects)) {
        throw new AppError("Objects must be an array", 400);
      }
      // Validate objects structure
      const validObjects: WorkspaceObject[] = objects.map(
        (obj: any, index: number) => {
          if (!obj.id || !obj.type || !obj.name) {
            throw new AppError(
              `Object at index ${index} is missing required fields (id, type, name)`,
              400
            );
          }
          return obj as WorkspaceObject;
        }
      );
      updates.objects = validObjects;
    }

    if (scene !== undefined) {
      if (typeof scene !== "object") {
        throw new AppError("scene must be an object if provided", 400);
      }
      updates.scene = scene as CanonicalScene;
    }

    if (isPublic !== undefined) {
      if (typeof isPublic !== "boolean") {
        throw new AppError("isPublic must be a boolean", 400);
      }
      updates.isPublic = isPublic;
    }

    const updated = await layoutStore.update(id, updates);

    if (!updated) {
      throw new AppError("Failed to update layout", 500);
    }

    res.json({
      success: true,
      data: updated,
      message: "Layout updated successfully",
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/layouts/:id - Delete a layout
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const exists = await layoutStore.exists(id);
      if (!exists) {
        throw new AppError("Layout not found", 404);
      }

      const deleted = await layoutStore.delete(id);

      if (!deleted) {
        throw new AppError("Failed to delete layout", 500);
      }

      res.json({
        success: true,
        message: "Layout deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
