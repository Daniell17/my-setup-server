import mongoose, { Document, Schema } from 'mongoose';
import { WorkspaceObject } from '../types';
import type { CanonicalScene } from '../types/scene';

export interface ILayout extends Document {
  name: string;
  objects: WorkspaceObject[];
  createdAt: Date;
  updatedAt: Date;
  isPublic?: boolean;
  userId?: string;
  forkedFrom?: string; // Original layout ID if this is a fork
  forkCount: number; // Number of times this layout has been forked
  scene?: CanonicalScene;
  version: number;
  parentLayoutId?: string;
  provenance?: {
    originalLayoutId?: string;
    originalOwnerId?: string;
    [key: string]: unknown;
  };
  stats: {
    views: number;
    likes: number;
    remixes: number;
  };
  status: "draft" | "published" | "pending" | "rejected" | "removed";
}

const LayoutSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    objects: { type: [Schema.Types.Mixed], required: true },
    isPublic: { type: Boolean, default: false },
    userId: { type: String, index: true },
    forkedFrom: { type: String },
    forkCount: { type: Number, default: 0 },
    scene: { type: Schema.Types.Mixed },
    version: { type: Number, default: 1 },
    parentLayoutId: { type: String },
    provenance: { type: Schema.Types.Mixed },
    stats: {
      type: {
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        remixes: { type: Number, default: 0 },
      },
      default: () => ({
        views: 0,
        likes: 0,
        remixes: 0,
      }),
    },
    status: {
      type: String,
      enum: ["draft", "published", "pending", "rejected", "removed"],
      default: "draft",
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    toJSON: {
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export default mongoose.model<ILayout>('Layout', LayoutSchema);

