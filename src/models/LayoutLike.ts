import mongoose, { Document, Schema } from "mongoose";

export interface ILayoutLike extends Document {
  layoutId: string;
  userId: string;
  createdAt: Date;
}

const LayoutLikeSchema: Schema = new Schema(
  {
    layoutId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

LayoutLikeSchema.index({ layoutId: 1, userId: 1 }, { unique: true });

export default mongoose.model<ILayoutLike>("LayoutLike", LayoutLikeSchema);

