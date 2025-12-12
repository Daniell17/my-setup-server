import { Router, Request, Response, NextFunction } from 'express';
import CustomObject from '../models/CustomObject';
import { AppError } from '../middleware/errorHandler';
import { protect, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/custom-objects - Get custom objects (public or user's)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.query.userId as string | undefined;
    
    const query: any = {};
    if (userId) {
      query.$or = [{ userId }, { isPublic: true }];
    } else {
      query.isPublic = true;
    }
    
    const objects = await CustomObject.find(query).sort({ usageCount: -1, createdAt: -1 });

    res.json({
      success: true,
      data: objects,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/custom-objects - Create a custom object
router.post('/', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError('Not authorized', 401);
    }

    const { name, type, geometry, material, scale, isPublic } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new AppError('Object name is required', 400);
    }

    if (!type || !geometry || !scale) {
      throw new AppError('Type, geometry, and scale are required', 400);
    }

    const customObject = await CustomObject.create({
      name: name.trim(),
      type,
      geometry,
      material: material || { color: '#ffffff', roughness: 0.5, metalness: 0.5 },
      scale,
      userId: authReq.user.id,
      isPublic: isPublic ?? false,
      usageCount: 0,
    });

    res.status(201).json({
      success: true,
      data: customObject,
      message: 'Custom object created successfully',
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/custom-objects/:id - Delete a custom object
router.delete('/:id', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError('Not authorized', 401);
    }

    const { id } = req.params;
    const customObject = await CustomObject.findById(id);

    if (!customObject) {
      throw new AppError('Custom object not found', 404);
    }

    if (customObject.userId !== authReq.user.id) {
      throw new AppError('Not authorized to delete this object', 403);
    }

    await CustomObject.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Custom object deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;

