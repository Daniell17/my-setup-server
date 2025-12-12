import { Router, Request, Response, NextFunction } from 'express';
import Template from '../models/Template';
import { AppError } from '../middleware/errorHandler';
import { protect, AuthRequest } from '../middleware/authMiddleware';
import { WorkspaceObject } from '../types';

const router = Router();

// GET /api/templates - Get all templates (public or user's)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.query.category as string | undefined;
    const userId = req.query.userId as string | undefined;
    
    const query: any = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    
    // If userId provided, show user's templates + public ones
    if (userId) {
      query.$or = [{ userId }, { isPublic: true }];
    } else {
      query.isPublic = true;
    }
    
    const templates = await Template.find(query).sort({ usageCount: -1, createdAt: -1 });

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/templates/:id - Get a specific template
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const template = await Template.findById(id);

    if (!template) {
      throw new AppError('Template not found', 404);
    }

    // Increment usage count
    template.usageCount = (template.usageCount || 0) + 1;
    await template.save();

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/templates - Create a new template
router.post('/', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError('Not authorized', 401);
    }

    const { name, description, category, objects, isPublic } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new AppError('Template name is required', 400);
    }

    if (!category || typeof category !== 'string') {
      throw new AppError('Template category is required', 400);
    }

    if (!Array.isArray(objects)) {
      throw new AppError('Objects must be an array', 400);
    }

    const template = await Template.create({
      name: name.trim(),
      description: description || '',
      category,
      objects: objects as WorkspaceObject[],
      isPublic: isPublic ?? true,
      userId: authReq.user.id,
      usageCount: 0,
    });

    res.status(201).json({
      success: true,
      data: template,
      message: 'Template created successfully',
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/templates/:id - Update a template
router.put('/:id', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError('Not authorized', 401);
    }

    const { id } = req.params;
    const template = await Template.findById(id);

    if (!template) {
      throw new AppError('Template not found', 404);
    }

    // Check ownership
    if (template.userId !== authReq.user.id) {
      throw new AppError('Not authorized to update this template', 403);
    }

    const { name, description, category, objects, isPublic } = req.body;
    const updates: any = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        throw new AppError('Template name must be a non-empty string', 400);
      }
      updates.name = name.trim();
    }

    if (description !== undefined) {
      updates.description = description;
    }

    if (category !== undefined) {
      updates.category = category;
    }

    if (objects !== undefined) {
      if (!Array.isArray(objects)) {
        throw new AppError('Objects must be an array', 400);
      }
      updates.objects = objects;
    }

    if (isPublic !== undefined) {
      updates.isPublic = isPublic;
    }

    const updated = await Template.findByIdAndUpdate(id, updates, { new: true });

    res.json({
      success: true,
      data: updated,
      message: 'Template updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/templates/:id - Delete a template
router.delete('/:id', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError('Not authorized', 401);
    }

    const { id } = req.params;
    const template = await Template.findById(id);

    if (!template) {
      throw new AppError('Template not found', 404);
    }

    // Check ownership
    if (template.userId !== authReq.user.id) {
      throw new AppError('Not authorized to delete this template', 403);
    }

    await Template.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;

