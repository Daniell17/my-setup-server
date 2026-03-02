import { Router, Request, Response, NextFunction } from "express";
import { protect, AuthRequest } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";
import Brand from "../models/Brand";
import ObjectTemplate from "../models/ObjectTemplate";
import Layout from "../models/Layout";
import User from "../models/User";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// ----- Brand management -----

router.get(
  "/brands",
  protect,
  requireRole("admin"),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const brands = await Brand.find({}).sort({
        priorityWeight: -1,
        createdAt: -1,
      });
      res.json({ success: true, data: brands });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/brands",
  protect,
  requireRole("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, slug, logoUrl, websiteUrl, description } = req.body;
      if (!name || !slug) {
        throw new AppError("name and slug are required", 400);
      }

      const brand = await Brand.create({
        name,
        slug,
        logoUrl,
        websiteUrl,
        description,
      });

      res.status(201).json({ success: true, data: brand });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/brands/:id",
  protect,
  requireRole("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const brand = await Brand.findByIdAndUpdate(id, updates, { new: true });
      if (!brand) {
        throw new AppError("Brand not found", 404);
      }
      res.json({ success: true, data: brand });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/brands/:id",
  protect,
  requireRole("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await Brand.findByIdAndDelete(id);
      res.json({ success: true, message: "Brand deleted" });
    } catch (error) {
      next(error);
    }
  }
);

// ----- Object template (catalog) management -----

router.get(
  "/objects",
  protect,
  requireRole("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { brandId } = req.query as { brandId?: string };
      const query: any = {};
      if (brandId) query.brandId = brandId;

      const objects = await ObjectTemplate.find(query).sort({ createdAt: -1 });
      res.json({ success: true, data: objects });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/objects",
  protect,
  requireRole("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tpl = await ObjectTemplate.create(req.body);
      res.status(201).json({ success: true, data: tpl });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/objects/:id",
  protect,
  requireRole("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const tpl = await ObjectTemplate.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!tpl) {
        throw new AppError("Object template not found", 404);
      }
      res.json({ success: true, data: tpl });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/objects/:id",
  protect,
  requireRole("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await ObjectTemplate.findByIdAndDelete(id);
      res.json({ success: true, message: "Object template deleted" });
    } catch (error) {
      next(error);
    }
  }
);

// ----- Layout moderation -----

router.get(
  "/moderation/layouts",
  protect,
  requireRole("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = (req.query.status as string) || "pending";
      const layouts = await Layout.find({ status }).sort({ createdAt: -1 });
      res.json({ success: true, data: layouts });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/moderation/layouts/:id/approve",
  protect,
  requireRole("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const layout = await Layout.findById(id);
      if (!layout) {
        throw new AppError("Layout not found", 404);
      }
      layout.status = "published";
      layout.isPublic = true;
      await layout.save();
      res.json({ success: true, data: layout });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/moderation/layouts/:id/reject",
  protect,
  requireRole("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const layout = await Layout.findById(id);
      if (!layout) {
        throw new AppError("Layout not found", 404);
      }
      layout.status = "rejected";
      layout.isPublic = false;
      await layout.save();
      res.json({ success: true, data: layout });
    } catch (error) {
      next(error);
    }
  }
);

// ----- User management -----

router.get(
  "/users",
  protect,
  requireRole("admin"),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await User.find({}).sort({ createdAt: -1 });
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/users/:id/role",
  protect,
  requireRole("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { role } = req.body as { role?: "user" | "admin" };
      if (!role || (role !== "user" && role !== "admin")) {
        throw new AppError("role must be 'user' or 'admin'", 400);
      }

      const user = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true }
      );
      if (!user) {
        throw new AppError("User not found", 404);
      }

      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

