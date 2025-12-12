import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomObject extends Document {
  name: string;
  type: string; // 'box' | 'sphere' | 'cylinder' | 'custom'
  geometry: {
    type: string;
    args?: number[];
  };
  material: {
    color: string;
    roughness: number;
    metalness: number;
  };
  scale: [number, number, number];
  userId: string;
  isPublic: boolean;
  usageCount: number;
  modelUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomObjectSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  geometry: {
    type: { type: String, required: true },
    args: { type: [Number] },
  },
  material: {
    color: { type: String, default: '#ffffff' },
    roughness: { type: Number, default: 0.5 },
    metalness: { type: Number, default: 0.5 },
  },
  scale: { type: [Number], required: true },
  userId: { type: String, required: true, index: true },
  isPublic: { type: Boolean, default: false },
  usageCount: { type: Number, default: 0 },
  modelUrl: { type: String },
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

export default mongoose.model<ICustomObject>('CustomObject', CustomObjectSchema);

