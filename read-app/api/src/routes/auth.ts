import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { User } from "../../models/User";
import { signToken } from "../jwt";

export const authRouter = Router();

const RegisterSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

authRouter.post("/register", async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.flatten() });

  const { username, email, password } = parsed.data;

  const exists = await User.findOne({ $or: [{ email }, { username }] }).lean();
  if (exists) return res.status(409).json({ message: "Usuario o email ya existe" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ username, email, passwordHash });

  const token = signToken({ userId: String(user._id), username: user.username });

  return res.json({
    token,
    user: { id: String(user._id), username: user.username, email: user.email, avatarUrl: user.avatarUrl ?? null },
  });
});

const LoginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Datos inválidos" });

  const { identifier, password } = parsed.data;

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
  });

  if (!user) return res.status(401).json({ message: "Credenciales incorrectas" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Credenciales incorrectas" });

  const token = signToken({ userId: String(user._id), username: user.username });

  return res.json({
    token,
    user: { id: String(user._id), username: user.username, email: user.email, avatarUrl: user.avatarUrl ?? null },
  });
});
