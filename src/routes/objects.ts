import { Router, Request, Response, NextFunction } from 'express';
import ObjectTemplate from '../models/ObjectTemplate';
import { protect, AuthRequest } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// GET /api/objects - Get all object templates
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.query.category as string;
    const query = category ? { category } : {};
    
    const objects = await ObjectTemplate.find(query);

    res.json({
      success: true,
      data: objects,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/objects/seed - Seed default objects (Protected)
router.post('/seed', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Only allow specific users or just any auth user for now
    
    // Clear existing?
    // await ObjectTemplate.deleteMany({});

    const defaults = [
      {
        type: "desk",
        name: "Desk",
        category: "furniture",
        color: "#8B4513",
        scale: [2, 0.05, 1],
        dimensions: { width: 2, height: 0.05, depth: 1 },
        price: 200
      },
      {
        type: "monitor",
        name: "Monitor",
        category: "tech",
        color: "#1a1a2e",
        scale: [0.8, 0.5, 0.05],
        dimensions: { width: 0.8, height: 0.5, depth: 0.03 },
        price: 300
      },
      {
        type: "pc-tower",
        name: "PC Tower",
        category: "tech",
        color: "#2d2d2d",
        scale: [0.3, 0.6, 0.5],
        dimensions: { width: 0.2, height: 0.45, depth: 0.4 },
        price: 1500
      },
      {
        type: "chair",
        name: "Ergonomic Chair",
        category: "furniture",
        color: "#1a1a1a",
        scale: [0.6, 1.2, 0.6],
        dimensions: { width: 0.5, height: 0.6, depth: 0.5 },
        price: 400
      }
    ];

    for (const obj of defaults) {
      // Check if exists
      const exists = await ObjectTemplate.findOne({ type: obj.type, name: obj.name });
      if (!exists) {
        await ObjectTemplate.create(obj);
      }
    }

    const allObjects = await ObjectTemplate.find({});

    res.json({
      success: true,
      data: allObjects,
      message: "Objects seeded successfully"
    });
  } catch (error) {
    next(error);
  }
});

export default router;

