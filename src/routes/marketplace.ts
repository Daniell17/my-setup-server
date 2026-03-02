import { Router, Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/errorHandler";
import { protect, AuthRequest } from "../middleware/authMiddleware";
import Template from "../models/Template";
import Purchase from "../models/Purchase";

const router = Router();

// GET /api/marketplace/templates - list premium/public templates
router.get(
  "/templates",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const includeFree = req.query.includeFree === "true";
      const query: any = { isPublic: true };

      if (!includeFree) {
        query.isPremium = true;
      }

      const templates = await Template.find(query)
        .sort({ isPremium: -1, usageCount: -1, createdAt: -1 })
        .lean();

      res.json({
        success: true,
        data: templates,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/marketplace/purchase - record a purchase (Stripe integration can be added later)
router.post(
  "/purchase",
  protect,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        throw new AppError("Not authorized", 401);
      }

      const { templateId } = req.body as { templateId?: string };
      if (!templateId) {
        throw new AppError("templateId is required", 400);
      }

      const template = await Template.findById(templateId);
      if (!template) {
        throw new AppError("Template not found", 404);
      }

      const amountCents = template.priceCents ?? 0;
      const currency = template.currency ?? "USD";

      const purchase = await Purchase.create({
        userId: authReq.user.id,
        templateId: template.id,
        amountCents,
        currency,
        provider: "test",
      });

      res.status(201).json({
        success: true,
        data: purchase,
        message: "Purchase recorded (test provider). Integrate Stripe to charge real payments.",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

