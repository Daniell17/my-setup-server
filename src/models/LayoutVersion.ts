import mongoose, { Document, Schema } from "mongoose";
import type { CanonicalScene } from "../types/scene";
import type { WorkspaceObject } from "../types";

export interface ILayoutVersion extends Document {
  layoutId: string;
  version: number;
  scene?: CanonicalScene;
  objectsSnapshot: WorkspaceObject[];
  createdAt: Date;
}

const LayoutVersionSchema: Schema = new Schema(
  {
    layoutId: { type: String, required: true, index: true },
    version: { type: Number, required: true },
    scene: { type: Schema.Types.Mixed },
    objectsSnapshot: { type: [Schema.Types.Mixed], required: true },
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

LayoutVersionSchema.index({ layoutId: 1, version: -1 });

export default mongoose.model<ILayoutVersion>(
  "LayoutVersion",
  LayoutVersionSchema
);

