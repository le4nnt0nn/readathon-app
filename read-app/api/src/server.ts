import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { externalRouter } from "./routes/external";
import { authRouter } from "./routes/auth";
import { meRouter } from "./routes/me";
import { usersRouter } from "./routes/users";

import { auth } from "./middleware/auth";
import { optionalAuth } from "./middleware/optionalAuth";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 60_000, max: 200 }));

app.get("/health", (_, res) => res.json({ ok: true }));

app.use("/external", optionalAuth, externalRouter);
app.use("/auth", authRouter);
app.use("/me", auth, meRouter);
app.use("/users", auth, usersRouter);

async function main() {
  await mongoose.connect(process.env.MONGO_URI!);
  app.listen(process.env.PORT || 3000, () => console.log("API ready"));
}
main();
