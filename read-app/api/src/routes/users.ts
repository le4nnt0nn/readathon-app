import { Router } from "express";
import { User } from "../../models/User";
import { UserBook } from "../../models/UserBook";

export const usersRouter = Router();

usersRouter.get("/", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  const filter = q ? { username: { $regex: q, $options: "i" } } : {};
  const users = await User.find(filter).select("username avatarUrl").limit(30).lean();
  return res.json({ items: users.map(u => ({ id: String(u._id), username: u.username, avatarUrl: u.avatarUrl ?? null })) });
});

usersRouter.get("/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId).select("username avatarUrl").lean();
  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
  return res.json({ user: { id: String(user._id), username: user.username, avatarUrl: user.avatarUrl ?? null } });
});

usersRouter.get("/:userId/books", async (req, res) => {
  const status = req.query.status ? String(req.query.status) : null;
  const filter: any = { userId: req.params.userId };
  if (status === "WANT" || status === "READ") filter.status = status;

  const books = await UserBook.find(filter).sort({ updatedAt: -1 }).lean();
  return res.json({ items: books });
});
