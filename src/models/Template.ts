import mongoose, { Document, Schema } from 'mongoose';
import { WorkspaceObject } from '../types';

export interface ITemplate extends Document {
  name: string;
  description: string;
  category: string;
  objects: WorkspaceObject[];
  thumbnailUrl?: string;
  isPublic: boolean;
  userId?: string;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, required: true }, // e.g., 'Minimal', 'Gaming', 'Productivity'
  objects: { type: [Schema.Types.Mixed], required: true },
  thumbnailUrl: { type: String },
  isPublic: { type: Boolean, default: true },
  userId: { type: String, index: true },
  usageCount: { type: Number, default: 0 },
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

export default mongoose.model<ITemplate>('Template', TemplateSchema);

