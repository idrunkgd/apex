import { readFile } from "fs/promises";
import path from "path";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { rentals, checkIns, checkOuts, contracts } from "@/db/schema";
import { getSession } from "@/lib/session";
import { can } from "@/lib/rbac";
import { PHOTO_ANGLES } from "@/lib/checklist";
import { renderRentalPdf, type DocType, DOC_LABELS } from "@/lib/pdf/documents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Lit chaque photo depuis le disque, la convertit en JPEG (react-pdf n'imprime que JPEG/PNG,
// or les photos peuvent être en WebP/AVIF/HEIC) et l'encode en data URL.
async function resolvePhotos(photosJson?: string | null) {
  if (!photosJson) return [];
  let map: Record<string, string>;
  try {
    map = JSON.parse(photosJson);
  } catch {
    return [];
  }
  const { default: sharp } = await import("sharp").catch(() => ({ default: null as never }));

  const out: { label: string; src: string }[] = [];
  for (const a of PHOTO_ANGLES) {
    const url = map[a.key];
    if (!url) continue;
    try {
      const buf = await readFile(path.join(process.cwd(), "public", url));
      if (sharp) {
        const jpg = await sharp(buf).rotate().resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer();
        out.push({ label: a.label, src: `data:image/jpeg;base64,${jpg.toString("base64")}` });
      } else if (/\.(jpe?g|png)$/i.test(url)) {
        const mime = /\.png$/i.test(url) ? "image/png" : "image/jpeg";
        out.push({ label: a.label, src: `data:${mime};base64,${buf.toString("base64")}` });
      }
    } catch {
      /* fichier illisible ou conversion impossible — on saute cette photo */
    }
  }
  return out;
}

const TYPE_TO_CONTRACT: Record<DocType, string> = {
  contrat: "LOCATION",
  facture: "FACTURE",
  "edl-depart": "EDL_DEPART",
  "edl-retour": "EDL_RETOUR",
};

export async function GET(_req: Request, { params }: { params: Promise<{ id: string; type: string }> }) {
  const session = await getSession();
  if (!session || !can(session.role, "rental", "read")) {
    return new Response("Non autorisé", { status: 401 });
  }

  const { id, type: rawType } = await params;
  const type = rawType as DocType;
  if (!(type in DOC_LABELS)) return new Response("Type de document inconnu", { status: 404 });

  const rental = await db.query.rentals.findFirst({
    where: eq(rentals.id, id),
    with: { vehicle: true, customer: true },
  });
  if (!rental) return new Response("Location introuvable", { status: 404 });

  const checkIn = await db.query.checkIns.findFirst({ where: eq(checkIns.rentalId, id) });
  const checkOut = await db.query.checkOuts.findFirst({ where: eq(checkOuts.rentalId, id) });

  const checkInPhotos = type === "edl-depart" ? await resolvePhotos(checkIn?.photos) : [];
  const checkOutPhotos = type === "edl-retour" ? await resolvePhotos(checkOut?.photos) : [];

  const pdf = await renderRentalPdf(type, { rental, checkIn, checkOut, checkInPhotos, checkOutPhotos });

  // Archivage (une entrée par type et par location)
  const existing = await db
    .select({ id: contracts.id })
    .from(contracts)
    .where(and(eq(contracts.rentalId, id), eq(contracts.type, TYPE_TO_CONTRACT[type])));
  if (existing.length === 0) {
    await db.insert(contracts).values({ type: TYPE_TO_CONTRACT[type], rentalId: id, signe: false });
  }

  const filename = `${type}-${rental.reference}.pdf`;
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
