import { Router, Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/errorHandler";
import { layoutStore } from "../services/layoutStore";
import { WorkspaceObject } from "../types";

const router = Router();

// GET /api/layouts - Get all layouts
router.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    // Optional: filter by userId from query params (for future auth)
    const userId = req.query.userId as string | undefined;
    const layouts = layoutStore.getAll(userId);

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
router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const layout = layoutStore.getById(id);

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

// POST /api/layouts - Create a new layout
router.post("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, objects, userId, isPublic } = req.body;

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

    const layout = layoutStore.create({
      name: name.trim(),
      objects: validObjects,
      userId,
      isPublic,
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

// PUT /api/layouts/:id - Update a layout
router.put("/:id", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, objects, isPublic } = req.body;

    if (!layoutStore.exists(id)) {
      throw new AppError("Layout not found", 404);
    }

    const updates: {
      name?: string;
      objects?: WorkspaceObject[];
      isPublic?: boolean;
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

    if (isPublic !== undefined) {
      if (typeof isPublic !== "boolean") {
        throw new AppError("isPublic must be a boolean", 400);
      }
      updates.isPublic = isPublic;
    }

    const updated = layoutStore.update(id, updates);

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
router.delete("/:id", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!layoutStore.exists(id)) {
      throw new AppError("Layout not found", 404);
    }

    const deleted = layoutStore.delete(id);

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
});

export default router;
