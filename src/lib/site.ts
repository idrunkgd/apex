import "server-only";
import fs from "fs";
import path from "path";

export const HERO_FILE = path.join(process.cwd(), "public", "uploads", "site", "hero.jpg");

/** URL de l'image de bannière d'accueil si elle existe (avec cache-busting), sinon null. */
export function heroImageUrl(): string | null {
  try {
    const st = fs.statSync(HERO_FILE);
    return `/uploads/site/hero.jpg?v=${Math.floor(st.mtimeMs)}`;
  } catch {
    return null;
  }
}
