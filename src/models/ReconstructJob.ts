import mongoose, { Document, Schema } from "mongoose";
import type { CanonicalScene } from "../types/scene";

export type ReconstructJobStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed";

export interface IReconstructJob extends Document {
  userId: string;
  imageUrl?: string;
  status: ReconstructJobStatus;
  scene?: CanonicalScene;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReconstructJobSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    imageUrl: { type: String },
    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"],
      default: "queued",
      index: true,
    },
    scene: { type: Schema.Types.Mixed },
    error: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export default mongoose.model<IReconstructJob>(
  "ReconstructJob",
  ReconstructJobSchema
);

