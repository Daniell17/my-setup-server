import mongoose, { Document, Schema } from 'mongoose';

export interface IObjectTemplate extends Document {
  type: string;
  name: string;
  category: string;
  scale: [number, number, number];
  color: string;
  dimensions?: any;
  material?: any;
  price: number;
  thumbnailUrl?: string;
  modelUrl?: string;
}

const ObjectTemplateSchema: Schema = new Schema({
  type: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true }, // e.g., 'furniture', 'tech', 'decoration'
  scale: { type: [Number], required: true },
  color: { type: String, required: true },
  dimensions: { type: Schema.Types.Mixed },
  material: { type: Schema.Types.Mixed },
  price: { type: Number, default: 0 },
  thumbnailUrl: { type: String },
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

export default mongoose.model<IObjectTemplate>('ObjectTemplate', ObjectTemplateSchema);

