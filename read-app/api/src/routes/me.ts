import { Router } from "express";
import { z } from "zod";
import { UserBook } from "../../models/UserBook";
import { User } from "../../models/User";

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
  const user = await User.findById(userId).select("username email avatarUrl").lean();
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
  if (!parsed.success) return res.status(400).json({ message: "Datos inválidos" });

  const data = parsed.data;

  const existing = await UserBook.findOne({ userId, source: data.source, externalId: data.externalId });
  if (existing) {
    existing.status = data.status;
    if (data.status === "READ" && !existing.finishedAt) existing.finishedAt = new Date();
    if (data.status === "WANT") existing.finishedAt = undefined;

    existing.title = data.title;
    existing.authors = data.authors;
    existing.thumbnail = data.thumbnail ?? undefined;
    existing.categories = data.categories;

    await existing.save();
    return res.json({ item: existing });
  }

  const created = await UserBook.create({
    userId,
    ...data,
    finishedAt: data.status === "READ" ? new Date() : undefined,
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
  if (!parsed.success) return res.status(400).json({ message: "Datos inválidos" });

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
  const deleted = await UserBook.findOneAndDelete({ _id: req.params.id, userId });
  if (!deleted) return res.status(404).json({ message: "No encontrado" });
  return res.json({ ok: true });
});

meRouter.get("/stats", async (req, res) => {
  const userId = (req as any).user.userId as string;
  const [want, read] = await Promise.all([
    UserBook.countDocuments({ userId, status: "WANT" }),
    UserBook.countDocuments({ userId, status: "READ" }),
  ]);
  return res.json({ want, read });
});
