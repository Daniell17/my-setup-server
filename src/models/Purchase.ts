import mongoose, { Document, Schema } from "mongoose";

export interface IPurchase extends Document {
  userId: string;
  templateId: string;
  amountCents: number;
  currency: string;
  provider: "stripe" | "test";
  providerChargeId?: string;
  createdAt: Date;
}

const PurchaseSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    templateId: { type: String, required: true, index: true },
    amountCents: { type: Number, required: true },
    currency: { type: String, required: true },
    provider: { type: String, enum: ["stripe", "test"], default: "test" },
    providerChargeId: { type: String },
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

export default mongoose.model<IPurchase>("Purchase", PurchaseSchema);

