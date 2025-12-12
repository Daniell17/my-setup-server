import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AppError } from "../middleware/errorHandler";
import { protect, AuthRequest } from "../middleware/authMiddleware";

const router = Router();

const generateToken = (id: string, username: string, email: string) => {
  return jwt.sign(
    { id, username, email },
    process.env.JWT_SECRET || "dev_secret",
    {
      expiresIn: "30d",
    }
  );
};

// POST /api/auth/register
router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        throw new AppError("Please provide all fields", 400);
      }

      // Check if user exists
      const userExists = await User.findOne({ $or: [{ email }, { username }] });
      if (userExists) {
        throw new AppError("User already exists", 400);
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const user = await User.create({
        username,
        email,
        passwordHash,
      });

      if (user) {
        const userId = user._id.toString();
        res.status(201).json({
          success: true,
          data: {
            _id: userId,
            username: user.username,
            email: user.email,
            token: generateToken(userId, user.username, user.email),
          },
        });
      } else {
        throw new AppError("Invalid user data", 400);
      }
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/login
router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError("Please add email and password", 400);
      }

      // Check for user email
      const user = await User.findOne({ email });

      if (user && (await bcrypt.compare(password, user.passwordHash))) {
        const userId = user._id.toString();
        res.json({
          success: true,
          data: {
            _id: userId,
            username: user.username,
            email: user.email,
            token: generateToken(userId, user.username, user.email),
          },
        });
      } else {
        throw new AppError("Invalid credentials", 401);
      }
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/auth/me
router.get(
  "/me",
  protect,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        throw new AppError("Not authorized", 401);
      }
      const user = await User.findById(authReq.user.id);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/auth/profile
router.put(
  "/profile",
  protect,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        throw new AppError("Not authorized", 401);
      }

      const { username, bio, avatar } = req.body;
      const updates: any = {};

      if (username !== undefined) {
        if (typeof username !== "string" || username.trim().length === 0) {
          throw new AppError("Username must be a non-empty string", 400);
        }
        // Check if username is already taken
        const existingUser = await User.findOne({
          username: username.trim(),
          _id: { $ne: authReq.user.id },
        });
        if (existingUser) {
          throw new AppError("Username already taken", 400);
        }
        updates.username = username.trim();
      }

      if (bio !== undefined) {
        updates.bio = bio;
      }

      if (avatar !== undefined) {
        updates.avatar = avatar;
      }

      const user = await User.findByIdAndUpdate(authReq.user.id, updates, {
        new: true,
      });

      res.json({
        success: true,
        data: user,
        message: "Profile updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
