import { Schema, model } from "mongoose";

const FriendshipSchema = new Schema(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED"],
      default: "PENDING",
      index: true,
    },
  },
  { timestamps: true },
);

FriendshipSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });

export const Friendship = model("Friendship", FriendshipSchema);
