import mongoose, { Document, Schema } from 'mongoose';
import { WorkspaceObject } from '../types';

export interface ILayout extends Document {
  name: string;
  objects: WorkspaceObject[];
  createdAt: Date;
  updatedAt: Date;
  isPublic?: boolean;
  userId?: string;
  forkedFrom?: string; // Original layout ID if this is a fork
  forkCount: number; // Number of times this layout has been forked
}

const LayoutSchema: Schema = new Schema({
  name: { type: String, required: true },
  objects: { type: [Schema.Types.Mixed], required: true },
  isPublic: { type: Boolean, default: false },
  userId: { type: String, index: true },
  forkedFrom: { type: String },
  forkCount: { type: Number, default: 0 },
}, {
  timestamps: true, // Automatically manages createdAt and updatedAt
  toJSON: {
    transform: (_doc: any, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

export default mongoose.model<ILayout>('Layout', LayoutSchema);

