import { Schema, model } from "mongoose";

const ActivitySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["ADDED_BOOK", "FINISHED_BOOK", "RATED_BOOK"],
      required: true,
    },
    bookTitle: { type: String, required: true },
    rating: { type: Number },
  },
  { timestamps: true }
);

ActivitySchema.index({ userId: 1, createdAt: -1 });

export const Activity = model("Activity", ActivitySchema);