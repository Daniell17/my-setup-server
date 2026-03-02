import mongoose, { Document, Schema } from "mongoose";

export interface IBrand extends Document {
  name: string;
  slug: string;
  logoUrl?: string;
  websiteUrl?: string;
  description?: string;
  isVerified: boolean;
  isSponsored: boolean;
  priorityWeight: number;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    logoUrl: { type: String },
    websiteUrl: { type: String },
    description: { type: String },
    isVerified: { type: Boolean, default: false },
    isSponsored: { type: Boolean, default: false },
    priorityWeight: { type: Number, default: 0 },
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

export default mongoose.model<IBrand>("Brand", BrandSchema);

