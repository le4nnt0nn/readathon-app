import { Schema, model, Types } from "mongoose";

const UserBookSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    source: { type: String, enum: ["GOOGLE"], default: "GOOGLE", index: true },
    externalId: { type: String, required: true, index: true },

    title: { type: String, required: true },
    authors: { type: [String], default: [] },
    thumbnail: { type: String },
    categories: { type: [String], default: [] },

    status: { type: String, enum: ["WANT", "READ"], required: true, index: true },

    rating: { type: Number, min: 1, max: 5 },
    review: { type: String, maxlength: 2000 },

    finishedAt: { type: Date }
  },
  { timestamps: true }
);

UserBookSchema.index({ userId: 1, source: 1, externalId: 1 }, { unique: true });

export const UserBook = model("UserBook", UserBookSchema);
