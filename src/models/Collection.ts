import mongoose, { Document, Schema } from "mongoose";

export interface ICollection extends Document {
  name: string;
  description?: string;
  ownerId: string;
  layoutIds: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    ownerId: { type: String, required: true, index: true },
    layoutIds: { type: [String], required: true, default: [] },
    isPublic: { type: Boolean, default: false },
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

export default mongoose.model<ICollection>("Collection", CollectionSchema);

