"use server";
import { z } from "zod";
import { eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { vehicles, reservations, rentals, deposits, statusHistory, notifications, activityLogs } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { daysBetween } from "@/lib/format";

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const numOrNull = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim().replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const vehicleSchema = z.object({
  marque: z.string().min(1, "Marque requise"),
  modele: z.string().min(1, "Modèle requis"),
  annee: z.coerce.number().int().min(1950).max(2100),
  puissanceCh: z.coerce.number().int().min(1, "Puissance requise"),
});

export type AdminFormState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string>; id?: string };

function readVehicle(fd: FormData) {
  const equipRaw = String(fd.get("equipements") || "").trim();
  return {
    marque: String(fd.get("marque") || "").trim(),
    modele: String(fd.get("modele") || "").trim(),
    version: String(fd.get("version") || "").trim() || null,
    annee: Number(fd.get("annee")) || new Date().getFullYear(),
    kilometrage: Number(fd.get("kilometrage")) || 0,
    carburant: String(fd.get("carburant") || "ESSENCE"),
    puissanceCh: Number(fd.get("puissanceCh")) || 0,
    coupleNm: numOrNull(fd.get("coupleNm")),
    accel0100: numOrNull(fd.get("accel0100")),
    vitesseMax: numOrNull(fd.get("vitesseMax")),
    moteur: String(fd.get("moteur") || "").trim() || null,
    boite: String(fd.get("boite") || "AUTO"),
    transmission: String(fd.get("transmission") || "PROPULSION"),
    carrosserie: String(fd.get("carrosserie") || "COUPE"),
    couleurExt: String(fd.get("couleurExt") || "").trim() || null,
    couleurInt: String(fd.get("couleurInt") || "").trim() || null,
    statut: String(fd.get("statut") || "DISPONIBLE"),
    destination: String(fd.get("destination") || "LES_DEUX"),
    vedette: fd.get("vedette") === "on" || fd.get("vedette") === "true",
    prixAffiche: numOrNull(fd.get("prixAffiche")),
    prixSouhaite: numOrNull(fd.get("prixSouhaite")),
    prixJour: numOrNull(fd.get("prixJour")),
    prixWeekend: numOrNull(fd.get("prixWeekend")),
    prixSemaine: numOrNull(fd.get("prixSemaine")),
    caution: numOrNull(fd.get("caution")),
    description: String(fd.get("description") || "").trim() || null,
    equipements: equipRaw ? JSON.stringify(equipRaw.split(",").map((s) => s.trim()).filter(Boolean)) : null,
  };
}

export async function createVehicle(_prev: AdminFormState, fd: FormData): Promise<AdminFormState> {
  const user = await requirePermission("vehicle", "write");
  const parsed = vehicleSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    parsed.error.issues.forEach((i) => (fe[String(i.path[0])] = i.message));
    return { error: "Merci de corriger les champs indiqués.", fieldErrors: fe };
  }
  const data = readVehicle(fd);
  const count = (await db.select({ id: vehicles.id }).from(vehicles)).length;
  const ref = `APX-${1001 + count}`;
  const slug = slugify(`${data.marque}-${data.modele}-${ref}`);

  const [row] = await db.insert(vehicles).values({ ...data, refInterne: ref, slug }).returning();
  // une seule voiture en vedette à la fois
  if (data.vedette) await db.update(vehicles).set({ vedette: false }).where(ne(vehicles.id, row.id));
  await db.insert(statusHistory).values({ vehicleId: row.id, nouveauStatut: data.statut, raison: "Création" });
  await db.insert(activityLogs).values({ userId: user.id, action: "CREATE", entite: "Vehicle", entiteId: row.id });

  revalidatePath("/admin/flotte");
  revalidatePath("/location");
  revalidatePath("/vente");
  redirect(`/admin/flotte/${row.id}`);
}

export async function updateVehicle(id: string, _prev: AdminFormState, fd: FormData): Promise<AdminFormState> {
  const user = await requirePermission("vehicle", "write");
  const parsed = vehicleSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    parsed.error.issues.forEach((i) => (fe[String(i.path[0])] = i.message));
    return { error: "Merci de corriger les champs indiqués.", fieldErrors: fe };
  }
  const data = readVehicle(fd);
  await db.update(vehicles).set({ ...data, updatedAt: new Date() }).where(eq(vehicles.id, id));
  // une seule voiture en vedette à la fois
  if (data.vedette) await db.update(vehicles).set({ vedette: false }).where(ne(vehicles.id, id));
  await db.insert(activityLogs).values({ userId: user.id, action: "UPDATE", entite: "Vehicle", entiteId: id });

  revalidatePath(`/admin/flotte/${id}`);
  revalidatePath("/admin/flotte");
  revalidatePath("/location");
  revalidatePath("/vente");
  redirect(`/admin/flotte/${id}`);
}

export async function changeVehicleStatus(id: string, statut: string) {
  const user = await requirePermission("vehicle", "write");
  const current = await db.query.vehicles.findFirst({ where: eq(vehicles.id, id) });
  if (!current) return;
  await db.update(vehicles).set({ statut, updatedAt: new Date() }).where(eq(vehicles.id, id));
  await db.insert(statusHistory).values({ vehicleId: id, ancienStatut: current.statut, nouveauStatut: statut, raison: "Modification manuelle" });
  await db.insert(activityLogs).values({ userId: user.id, action: "STATUS", entite: "Vehicle", entiteId: id, detail: statut });
  revalidatePath(`/admin/flotte/${id}`);
  revalidatePath("/admin/flotte");
}

// ---------------------------------------------------------------- Réservations
export async function setReservationStatus(id: string, statut: string) {
  await requirePermission("reservation", "write");
  await db.update(reservations).set({ statut }).where(eq(reservations.id, id));
  revalidatePath("/admin/locations");
  revalidatePath("/admin");
}

export async function convertReservationToRental(id: string) {
  const user = await requirePermission("rental", "write");
  const resa = await db.query.reservations.findFirst({ where: eq(reservations.id, id), with: { vehicle: true } });
  if (!resa) return;

  // éviter les doublons
  const existing = await db.query.rentals.findFirst({ where: eq(rentals.reservationId, id) });
  if (existing) return;

  const jours = daysBetween(resa.dateDepart, resa.dateRetour);
  const total = resa.prixTotal ?? (resa.vehicle?.prixJour ? Math.round(resa.vehicle.prixJour * jours) : 0);
  const ref = `LOC-${Math.floor(1000 + Math.random() * 9000)}`;

  const [rental] = await db.insert(rentals).values({
    reference: ref,
    reservationId: id,
    vehicleId: resa.vehicleId,
    customerId: resa.customerId,
    dateDepart: resa.dateDepart,
    dateRetour: resa.dateRetour,
    total,
    statut: "CONFIRMEE",
  }).returning();

  if (resa.caution) {
    await db.insert(deposits).values({ rentalId: rental.id, montant: resa.caution, statut: "BLOQUEE" });
  }
  await db.update(reservations).set({ statut: "CONFIRMEE" }).where(eq(reservations.id, id));
  await db.update(vehicles).set({ statut: "RESERVE" }).where(eq(vehicles.id, resa.vehicleId));
  await db.insert(notifications).values({
    type: "LOCATION",
    message: `Location ${ref} créée depuis la réservation ${resa.reference}`,
    lien: "/admin/locations",
  });
  await db.insert(activityLogs).values({ userId: user.id, action: "CONVERT", entite: "Reservation", entiteId: id });

  revalidatePath("/admin/reservations");
  revalidatePath("/admin/locations");
  revalidatePath("/admin");
  redirect("/admin/locations");
}
