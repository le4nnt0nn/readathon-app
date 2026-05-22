import { Router } from "express";
import { User } from "../../models/User";
import { UserBook } from "../../models/UserBook";
import { Friendship } from "../../models/Friendship";
import { Types } from "mongoose";

export const usersRouter = Router();

function mapFriendship(currentUserId: string, friendship: any) {
  if (!friendship)
    return { friendshipStatus: "NONE", requestId: null, direction: null };

  return {
    friendshipStatus: friendship.status,
    requestId: String(friendship._id),
    direction:
      String(friendship.requesterId) === currentUserId
        ? "OUTGOING"
        : "INCOMING",
  };
}

usersRouter.get("/", async (req, res) => {
  const currentUserId = (req as any).user.userId as string;
  const q = String(req.query.q ?? "").trim();
  const filter: any = {
    _id: { $ne: currentUserId },
    ...(q ? { username: { $regex: q, $options: "i" } } : {}),
  };
  const users = await User.find(filter)
    .select("username avatarUrl")
    .limit(30)
    .lean();
  const userIds = users.map((u) => u._id);
  const friendships = await Friendship.find({
    $or: [
      { requesterId: currentUserId, recipientId: { $in: userIds } },
      { requesterId: { $in: userIds }, recipientId: currentUserId },
    ],
  }).lean();

  return res.json({
    items: users.map((u) => {
      const friendship = friendships.find(
        (f) =>
          String(f.requesterId) === String(u._id) ||
          String(f.recipientId) === String(u._id),
      );
      return {
        id: String(u._id),
        username: u.username,
        avatarUrl: u.avatarUrl ?? null,
        ...mapFriendship(currentUserId, friendship),
      };
    }),
  });
});

usersRouter.get("/:userId", async (req, res) => {
  const currentUserId = (req as any).user.userId as string;
  const user = await User.findById(req.params.userId)
    .select("username avatarUrl")
    .lean();
  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

  const isSelf = currentUserId === String(user._id);
  const friendship = isSelf
    ? null
    : await Friendship.findOne({
        $or: [
          { requesterId: currentUserId, recipientId: req.params.userId },
          { requesterId: req.params.userId, recipientId: currentUserId },
        ],
      }).lean();
  const canViewProfile = isSelf || friendship?.status === "ACCEPTED";

  const stats = canViewProfile
    ? {
        want: await UserBook.countDocuments({
          userId: req.params.userId,
          status: "WANT",
        }),
        read: await UserBook.countDocuments({
          userId: req.params.userId,
          status: "READ",
        }),
      }
    : null;

  return res.json({
    user: {
      id: String(user._id),
      username: user.username,
      avatarUrl: user.avatarUrl ?? null,
    },
    canViewProfile,
    stats,
    ...mapFriendship(currentUserId, friendship),
  });
});

usersRouter.get("/:userId/books", async (req, res) => {
  const currentUserId = (req as any).user.userId as string;
  const isSelf = currentUserId === req.params.userId;
  const friendship = isSelf
    ? null
    : await Friendship.findOne({
        status: "ACCEPTED",
        $or: [
          { requesterId: currentUserId, recipientId: req.params.userId },
          { requesterId: req.params.userId, recipientId: currentUserId },
        ],
      }).lean();

  if (!isSelf && !friendship) {
    return res
      .status(403)
      .json({ message: "Solicitud de seguimiento no aceptada" });
  }

  const status = req.query.status ? String(req.query.status) : null;
  const filter: any = { userId: req.params.userId };
  if (status === "WANT" || status === "READ") filter.status = status;

  const books = await UserBook.find(filter).sort({ updatedAt: -1 }).lean();
  return res.json({ items: books });
});

usersRouter.post("/:userId/friend-request", async (req, res) => {
  const currentUserId = (req as any).user.userId as string;
  const targetUserId = req.params.userId;

  if (!Types.ObjectId.isValid(targetUserId)) {
    return res.status(400).json({ message: "Usuario invalido" });
  }

  if (currentUserId === targetUserId) {
    return res
      .status(400)
      .json({ message: "No puedes solicitarte seguimiento a ti mismo" });
  }

  const target = await User.findById(targetUserId).select("_id").lean();
  if (!target)
    return res.status(404).json({ message: "Usuario no encontrado" });

  const existing = await Friendship.findOne({
    $or: [
      { requesterId: currentUserId, recipientId: targetUserId },
      { requesterId: targetUserId, recipientId: currentUserId },
    ],
  });

  if (existing) {
    if (
      existing.status === "PENDING" &&
      String(existing.recipientId) === currentUserId
    ) {
      existing.status = "ACCEPTED";
      await existing.save();
    }
    return res.json({ item: existing });
  }

  const created = await Friendship.create({
    requesterId: currentUserId,
    recipientId: targetUserId,
  });

  return res.status(201).json({ item: created });
});
