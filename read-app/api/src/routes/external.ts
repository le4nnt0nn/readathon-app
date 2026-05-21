import { Router } from "express";
import axios from "axios";
import NodeCache from "node-cache";
import { UserBook } from "../../models/UserBook";
const cache = new NodeCache({ stdTTL: 60 * 5 });
export const externalRouter = Router();

externalRouter.get("/books", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  const page = Number(req.query.page ?? 0);
  if (!q) return res.json({ items: [], total: 0 });

  const startIndex = page * 20;
  const cacheKey = `gbooks:${q}:${startIndex}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  const { data } = await axios.get(
    "https://www.googleapis.com/books/v1/volumes",
    {
      params: {
        q,
        startIndex,
        maxResults: 20,
        key: process.env.GOOGLE_BOOKS_KEY,
      },
    },
  );

  const items = (data.items ?? []).map((v: any) => ({
    source: "GOOGLE",
    externalId: v.id,
    title: v.volumeInfo?.title ?? "Sin título",
    authors: v.volumeInfo?.authors ?? [],
    categories: v.volumeInfo?.categories ?? [],
    thumbnail:
      v.volumeInfo?.imageLinks?.thumbnail
        ?.replace("zoom=1", "zoom=2")
        ?.replace("&edge=curl", "") ??
      v.volumeInfo?.imageLinks?.smallThumbnail
        ?.replace("zoom=1", "zoom=2")
        ?.replace("&edge=curl", "") ??
      null,
  }));

  const userId = (req as any).user?.userId;
  let enriched = items;

  if (userId) {
    const ids = items.map((x: any) => x.externalId);
    const userBooks = await UserBook.find({
      userId,
      source: "GOOGLE",
      externalId: { $in: ids },
    })
      .select("externalId status")
      .lean();

    const map = new Map(userBooks.map((b: any) => [b.externalId, b.status]));
    enriched = items.map((x: any) => ({
      ...x,
      userStatus: map.get(x.externalId) ?? null,
    }));
  }

  const response = { items: enriched, total: data.totalItems ?? 0 };
  cache.set(cacheKey, response);
  return res.json(response);
});
