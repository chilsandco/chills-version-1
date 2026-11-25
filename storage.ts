// Files the website writes at runtime (customer review photos, custom-design uploads, settings,
// quotes, pending exchanges) must outlive a deploy. A deploy replaces the app folder, so they live
// in one folder outside it. On the live server that is ~/chils-data next to the app's domain folder.
import fs from "fs";
import os from "os";
import path from "path";

export const DATA_DIR = process.env.CHILS_DATA_DIR || path.join(os.homedir(), "chils-data");
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

const SAFE_EXT = /^[a-z0-9]{1,5}$/;

/** Save an uploaded file and return the address it is served from (/uploads/<kind>/<name>). */
export function saveUpload(kind: "reviews" | "custom_designs" | "returns", filename: string, data: Buffer): string {
  const ext = path.extname(filename).slice(1).toLowerCase();
  const base = path.basename(filename, path.extname(filename)).replace(/[^\w.-]/g, "");
  if (!base || !SAFE_EXT.test(ext)) throw new Error(`Refusing file name ${filename}`);
  const dir = path.join(UPLOADS_DIR, kind);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${base}.${ext}`), data);
  return `/uploads/${kind}/${base}.${ext}`;
}

/** A data file in DATA_DIR. The first time, an existing copy in the app folder is moved over. */
export function dataFile(name: string): string {
  const target = path.join(DATA_DIR, name);
  const legacy = path.join(process.cwd(), name);
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(target) && fs.existsSync(legacy)) fs.copyFileSync(legacy, target);
  } catch (e: any) {
    console.error(`[CHILS DATA] Could not prepare ${name}:`, e.message);
  }
  return target;
}

/** Earlier uploads were written into the app folder; bring any that survive into DATA_DIR. */
export function adoptLegacyUploads(appDir: string) {
  for (const root of [path.join(appDir, "public", "uploads"), path.join(appDir, "dist", "uploads")]) {
    for (const kind of ["reviews", "custom_designs"]) {
      const from = path.join(root, kind);
      if (!fs.existsSync(from)) continue;
      const to = path.join(UPLOADS_DIR, kind);
      fs.mkdirSync(to, { recursive: true });
      for (const f of fs.readdirSync(from)) {
        if (!fs.existsSync(path.join(to, f))) fs.copyFileSync(path.join(from, f), path.join(to, f));
      }
    }
  }
}
