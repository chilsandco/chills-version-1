// /media/<uploads path>   about 1000px wide
// /media/s/<uploads path> 640px wide
// Product photos newer than the last `scripts/size_images.py` run. The first request fetches the
// original from the store, resizes it to WebP and keeps it on disk; every later request (and the
// CDN, since the address has no query string) gets the small file straight away.
import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import axios from "axios";
import type { Request, Response } from "express";

const DIR = process.env.MEDIA_CACHE_DIR || path.join(os.homedir(), "chils-media-cache");
const SAFE = /^[\w\-./ ()%,+@]+$/;
const LONG = "public, max-age=2592000, stale-while-revalidate=86400";

let sharpLoad: Promise<any | null> | null = null;
const getSharp = () =>
  (sharpLoad ??= import("sharp").then(m => m.default).catch(e => {
    console.warn("[CHILS MEDIA] sharp unavailable, serving originals:", e.message);
    return null;
  }));

const inflight = new Map<string, Promise<{ file: string; type: string }>>();

async function build(rel: string, width: number, storeUrl: string) {
  const sharp = await getSharp();
  const hash = crypto.createHash("sha1").update(rel).digest("hex").slice(0, 16);
  const ext = sharp ? "webp" : path.extname(rel).slice(1).toLowerCase() || "bin";
  const file = path.join(DIR, String(sharp ? width : "orig"), `${hash}.${ext}`);
  const type = sharp ? "image/webp" : ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;
  if (fs.existsSync(file)) return { file, type };

  const src = `${storeUrl.replace(/\/$/, "")}/wp-content/uploads/${rel.split("/").map(encodeURIComponent).join("/")}`;
  const { data } = await axios.get(src, { responseType: "arraybuffer", timeout: 15000, headers: { "User-Agent": "chils-media" } });
  const out: Buffer = sharp
    ? await sharp(Buffer.from(data)).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer()
    : Buffer.from(data);

  await fs.promises.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.promises.writeFile(tmp, out);
  await fs.promises.rename(tmp, file);
  return { file, type };
}

export function mediaHandler(storeUrl: () => string) {
  return async (req: Request, res: Response) => {
    const m = req.path.match(/^\/media\/(s\/)?(.+)$/);
    let rel = "";
    try { rel = m ? decodeURIComponent(m[2]) : ""; } catch { /* bad encoding */ }
    if (!rel || rel.includes("..") || !SAFE.test(rel)) return res.status(400).send("Bad path");
    const width = m![1] ? 640 : 1000;
    const key = `${width}:${rel}`;
    try {
      if (!inflight.has(key)) inflight.set(key, build(rel, width, storeUrl()).finally(() => inflight.delete(key)));
      const { file, type } = await inflight.get(key)!;
      res.setHeader("Content-Type", type);
      res.setHeader("Cache-Control", LONG);
      res.sendFile(file);
    } catch (e: any) {
      console.error(`[CHILS MEDIA] ${rel}: ${e.message}`);
      // still show the photo: send the visitor to the original at the store
      res.setHeader("Cache-Control", "no-store");
      res.redirect(302, `${storeUrl().replace(/\/$/, "")}/wp-content/uploads/${rel.split("/").map(encodeURIComponent).join("/")}`);
    }
  };
}

/** The uploads path inside a store image URL, or null. */
export function uploadsPathOf(url: string): string | null {
  try {
    return decodeURIComponent(url).split("/wp-content/uploads/")[1]?.split(/[?#]/)[0] || null;
  } catch {
    return null;
  }
}
