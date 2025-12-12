import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  layoutId: string;
  userId: string;
  username: string;
  content: string;
  parentId?: string; // For threaded comments
  likes: number;
  likedBy: string[]; // User IDs who liked
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema({
  layoutId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  username: { type: String, required: true },
  content: { type: String, required: true },
  parentId: { type: String },
  likes: { type: Number, default: 0 },
  likedBy: { type: [String], default: [] },
}, {
  timestamps: true,
  toJSON: {
    transform: (_doc: any, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

export default mongoose.model<IComment>('Comment', CommentSchema);

