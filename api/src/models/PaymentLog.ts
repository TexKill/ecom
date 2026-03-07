import { Schema, model } from "mongoose";

const paymentLogSchema = new Schema(
  {
    provider: { type: String, required: true, default: "liqpay" },
    orderId: { type: String, required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    transactionId: { type: String, default: "" },
    status: { type: String, required: true },
    callbackHash: { type: String, required: true, unique: true },
    payload: { type: Schema.Types.Mixed },
    processedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const PaymentLog = model("PaymentLog", paymentLogSchema);
