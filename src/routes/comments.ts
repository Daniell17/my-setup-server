import { Router, Request, Response, NextFunction } from 'express';
import Comment from '../models/Comment';
import { AppError } from '../middleware/errorHandler';
import { protect, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/comments/:layoutId - Get comments for a layout
router.get('/:layoutId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { layoutId } = req.params;
    const comments = await Comment.find({ layoutId, parentId: null })
      .sort({ createdAt: -1 })
      .populate('userId', 'username');

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentId: comment._id.toString() })
          .sort({ createdAt: 1 });
        return {
          ...comment.toJSON(),
          replies,
        };
      })
    );

    res.json({
      success: true,
      data: commentsWithReplies,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/comments - Create a comment
router.post('/', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError('Not authorized', 401);
    }

    const { layoutId, content, parentId } = req.body;

    if (!layoutId || !content || typeof content !== 'string' || content.trim().length === 0) {
      throw new AppError('Layout ID and content are required', 400);
    }

    if (content.trim().length > 1000) {
      throw new AppError('Comment is too long (max 1000 characters)', 400);
    }

    const comment = await Comment.create({
      layoutId,
      userId: authReq.user.id,
      username: authReq.user.username,
      content: content.trim(),
      parentId: parentId || undefined,
      likes: 0,
      likedBy: [],
    });

    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment created successfully',
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/comments/:id/like - Like/unlike a comment
router.put('/:id/like', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError('Not authorized', 401);
    }

    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    const userId = authReq.user.id;
    const isLiked = comment.likedBy.includes(userId);

    if (isLiked) {
      comment.likedBy = comment.likedBy.filter(id => id !== userId);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      comment.likedBy.push(userId);
      comment.likes += 1;
    }

    await comment.save();

    res.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/comments/:id - Delete a comment
router.delete('/:id', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError('Not authorized', 401);
    }

    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    if (comment.userId !== authReq.user.id) {
      throw new AppError('Not authorized to delete this comment', 403);
    }

    // Delete replies too
    await Comment.deleteMany({ parentId: id });
    await Comment.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;

