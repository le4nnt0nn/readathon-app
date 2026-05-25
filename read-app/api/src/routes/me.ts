import { Router } from "express";
import { z } from "zod";
import { UserBook } from "../../models/UserBook";
import { User } from "../../models/User";
import { Friendship } from "../../models/Friendship";
import { Activity } from "../../models/Activity";
import bcrypt from "bcrypt";
import { auth } from "../middleware/auth";

export const meRouter = Router();

const AddBookSchema = z.object({
  source: z.enum(["GOOGLE"]).default("GOOGLE"),
  externalId: z.string().min(1),
  title: z.string().min(1),
  authors: z.array(z.string()).optional().default([]),
  thumbnail: z.string().url().nullable().optional().default(null),
  categories: z.array(z.string()).optional().default([]),
  status: z.enum(["WANT", "READ"]),
});

meRouter.get("/profile", async (req, res) => {
  const userId = (req as any).user.userId as string;
  const user = await User.findById(userId)
    .select("username email avatarUrl")
    .lean();
  return res.json({ user: { id: userId, ...user } });
});

meRouter.get("/books", async (req, res) => {
  const userId = (req as any).user.userId as string;
  const status = req.query.status ? String(req.query.status) : null;

  const filter: any = { userId };
  if (status === "WANT" || status === "READ") filter.status = status;

  const books = await UserBook.find(filter).sort({ updatedAt: -1 }).lean();
  return res.json({ items: books });
});

meRouter.get("/books/:id", async (req, res) => {
  const userId = (req as any).user.userId as string;
  const book = await UserBook.findOne({ _id: req.params.id, userId }).lean();
  if (!book) return res.status(404).json({ message: "No encontrado" });
  return res.json({ item: book });
});

meRouter.post("/books", async (req, res) => {
  const userId = (req as any).user.userId as string;
  const parsed = AddBookSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Datos inválidos" });

  const data = parsed.data;

  const existing = await UserBook.findOne({
    userId,
    source: data.source,
    externalId: data.externalId,
  });
  if (existing) {
    const previousStatus = existing.status;
    existing.status = data.status;
    if (data.status === "READ" && !existing.finishedAt)
      existing.finishedAt = new Date();
    if (data.status === "WANT") existing.finishedAt = undefined;

    existing.title = data.title;
    existing.authors = data.authors;
    existing.thumbnail = data.thumbnail ?? undefined;
    existing.categories = data.categories;

    await existing.save();

    if (previousStatus !== "READ" && data.status === "READ") {
      await Activity.create({
        userId,
        type: "FINISHED_BOOK",
        bookTitle: existing.title,
      });
    }

    return res.json({ item: existing });
  }

  const created = await UserBook.create({
    userId,
    ...data,
    finishedAt: data.status === "READ" ? new Date() : undefined,
  });

  await Activity.create({
    userId,
    type: data.status === "READ" ? "FINISHED_BOOK" : "ADDED_BOOK",
    bookTitle: created.title,
  });

  return res.status(201).json({ item: created });
});

const PatchSchema = z.object({
  status: z.enum(["WANT", "READ"]).optional(),
  rating: z.number().min(1).max(5).nullable().optional(),
  review: z.string().max(2000).nullable().optional(),
});

meRouter.patch("/books/:id", async (req, res) => {
  const userId = (req as any).user.userId as string;
  const parsed = PatchSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Datos inválidos" });

  const book = await UserBook.findOne({ _id: req.params.id, userId });
  if (!book) return res.status(404).json({ message: "No encontrado" });

  const { status, rating, review } = parsed.data;

  if (status) {
    book.status = status;
    if (status === "READ" && !book.finishedAt) book.finishedAt = new Date();
    if (status === "WANT") book.finishedAt = undefined;
  }
  if (rating !== undefined) book.rating = rating ?? undefined;
  if (review !== undefined) book.review = review ?? undefined;

  await book.save();
  return res.json({ item: book });
});

meRouter.delete("/books/:id", async (req, res) => {
  const userId = (req as any).user.userId as string;
  const deleted = await UserBook.findOneAndDelete({
    _id: req.params.id,
    userId,
  });
  if (!deleted) return res.status(404).json({ message: "No encontrado" });
  return res.json({ ok: true });
});

meRouter.patch("/books/:id/rating", auth, async (req, res) => {
  const userId = (req as any).user.userId;
  const { id } = req.params;
  const { rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating inválido" });
  }

  const book = await UserBook.findOneAndUpdate(
    { _id: id, userId },
    { rating },
    { new: true },
  );

  if (!book) return res.status(404).json({ message: "Libro no encontrado" });

  res.json({ item: book });
});

meRouter.get("/stats", async (req, res) => {
  const userId = (req as any).user.userId as string;
  const [want, read] = await Promise.all([
    UserBook.countDocuments({ userId, status: "WANT" }),
    UserBook.countDocuments({ userId, status: "READ" }),
  ]);
  return res.json({ want, read });
});

meRouter.get("/friends", async (req, res) => {
  const userId = (req as any).user.userId as string;
  const friendships = await Friendship.find({
    status: "ACCEPTED",
    $or: [{ requesterId: userId }, { recipientId: userId }],
  })
    .populate("requesterId", "username avatarUrl")
    .populate("recipientId", "username avatarUrl")
    .sort({ updatedAt: -1 })
    .lean();

  const items = friendships.map((friendship: any) => {
    const friend =
      String(friendship.requesterId._id) === userId
        ? friendship.recipientId
        : friendship.requesterId;

    return {
      requestId: String(friendship._id),
      id: String(friend._id),
      username: friend.username,
      avatarUrl: friend.avatarUrl ?? null,
    };
  });

  return res.json({ items });
});

meRouter.get("/friend-requests", async (req, res) => {
  const userId = (req as any).user.userId as string;
  const incoming = await Friendship.find({
    recipientId: userId,
    status: "PENDING",
  })
    .populate("requesterId", "username avatarUrl")
    .sort({ createdAt: -1 })
    .lean();
  const outgoing = await Friendship.find({
    requesterId: userId,
    status: "PENDING",
  })
    .populate("recipientId", "username avatarUrl")
    .sort({ createdAt: -1 })
    .lean();

  return res.json({
    incoming: incoming.map((request: any) => ({
      requestId: String(request._id),
      id: String(request.requesterId._id),
      username: request.requesterId.username,
      avatarUrl: request.requesterId.avatarUrl ?? null,
    })),
    outgoing: outgoing.map((request: any) => ({
      requestId: String(request._id),
      id: String(request.recipientId._id),
      username: request.recipientId.username,
      avatarUrl: request.recipientId.avatarUrl ?? null,
    })),
  });
});

meRouter.post("/friend-requests/:requestId/accept", async (req, res) => {
  const userId = (req as any).user.userId as string;
  const request = await Friendship.findOne({
    _id: req.params.requestId,
    recipientId: userId,
    status: "PENDING",
  });

  if (!request)
    return res.status(404).json({ message: "Solicitud no encontrada" });

  request.status = "ACCEPTED";
  await request.save();

  return res.json({ item: request });
});

meRouter.delete("/friend-requests/:requestId", async (req, res) => {
  const userId = (req as any).user.userId as string;
  const deleted = await Friendship.findOneAndDelete({
    _id: req.params.requestId,
    status: "PENDING",
    $or: [{ requesterId: userId }, { recipientId: userId }],
  });

  if (!deleted)
    return res.status(404).json({ message: "Solicitud no encontrada" });

  return res.json({ ok: true });
});

meRouter.post("/change-password", auth, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "La nueva contraseña debe tener al menos 8 caracteres",
      });
    }

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Contraseña actual incorrecta" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newHash;
    await user.save();

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: "Error interno" });
  }
});

meRouter.get("/insights", auth, async (req, res) => {
  const userId = (req as any).user.userId;

  const books = await UserBook.find({ userId, status: "READ" }).lean();
  const genreCount: Record<string, number> = {};

  books.forEach((book) => {
    if (book.categories?.length) {
      const genre = book.categories[0];
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    }
  });

  const genres = Object.entries(genreCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  const topRated = books
    .filter((b) => typeof b.rating === "number")
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 3);

  res.json({
    genres,
    topRated,
  });
});

meRouter.get("/activities", auth, async (req, res) => {
  const userId = (req as any).user.userId;
  const activities = await Activity.find({ userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
    
  res.json({ items: activities });
});

meRouter.get("/feed", async (req, res) => {
  const userId = (req as any).user.userId;

  const friends = await Friendship.find({
    status: "ACCEPTED",
    $or: [{ requesterId: userId }, { recipientId: userId }],
  }).lean();

  const friendIds = friends.map((f) =>
    String(f.requesterId) === userId ? f.recipientId : f.requesterId,
  );

  const activities = await Activity.find({
    userId: { $in: friendIds },
  })
    .populate("userId", "username avatarUrl")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  res.json({ items: activities });
});
