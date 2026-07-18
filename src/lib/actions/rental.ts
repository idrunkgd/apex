"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  rentals, checkIns, checkOuts, vehicles, reservations, deposits, vehicleDamages, notifications, activityLogs,
} from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { saveImage } from "@/lib/storage";
import { daysBetween } from "@/lib/format";
import { CHECKIN_ITEMS, CHECKOUT_ITEMS, PHOTO_ANGLES } from "@/lib/checklist";

const FUEL_EUR_PER_PCT = 4;

export type RentalFormState = { ok?: boolean; error?: string };

async function collectPhotos(fd: FormData, subdir: string) {
  const map: Record<string, string> = {};
  for (const a of PHOTO_ANGLES) {
    const f = fd.get(`photo_${a.key}`);
    if (f instanceof File && f.size > 0) {
      const url = await saveImage(f, subdir);
      if (url) map[a.key] = url;
    }
  }
  return map;
}

export async function submitCheckIn(rentalId: string, _prev: RentalFormState, fd: FormData): Promise<RentalFormState> {
  const user = await requirePermission("rental", "write");
  const rental = await db.query.rentals.findFirst({ where: eq(rentals.id, rentalId) });
  if (!rental) return { error: "Location introuvable." };

  const checklist: Record<string, boolean> = {};
  for (const it of CHECKIN_ITEMS) checklist[it.key] = fd.get(`chk_${it.key}`) === "on";

  // Verrou : toute la checklist doit être cochée
  if (CHECKIN_ITEMS.some((it) => !checklist[it.key])) {
    return { error: "Check-in incomplet : tous les contrôles doivent être validés." };
  }
  // Verrou : les photos de tous les angles doivent être fournies
  const missingPhotos = PHOTO_ANGLES.filter((a) => {
    const f = fd.get(`photo_${a.key}`);
    return !(f instanceof File && f.size > 0);
  });
  if (missingPhotos.length > 0) {
    return { error: `Photos manquantes : ${missingPhotos.map((a) => a.label).join(", ")}.` };
  }

  const km = Number(fd.get("km")) || rental.kmDepart || 0;
  const carburant = Number(fd.get("carburant"));

  let photos: Record<string, string>;
  try {
    photos = await collectPhotos(fd, `rentals/${rentalId}/checkin`);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erreur lors de l'envoi des photos." };
  }
  const signature = String(fd.get("signature") || "") || null;
  if (!signature) return { error: "La signature du client est obligatoire pour valider la remise." };

  const existing = await db.query.checkIns.findFirst({ where: eq(checkIns.rentalId, rentalId) });
  const values = {
    rentalId, checklist: JSON.stringify(checklist), km, carburant,
    photos: JSON.stringify(photos), signature, agentId: user.id, agentNom: user.nom,
  };
  if (existing) await db.update(checkIns).set(values).where(eq(checkIns.rentalId, rentalId));
  else await db.insert(checkIns).values(values);

  await db.update(rentals).set({ statut: "EN_COURS", dateDepartReel: new Date(), kmDepart: km, carburantDepart: carburant }).where(eq(rentals.id, rentalId));
  await db.update(vehicles).set({ statut: "LOUE", updatedAt: new Date() }).where(eq(vehicles.id, rental.vehicleId));
  if (rental.reservationId) await db.update(reservations).set({ statut: "EN_COURS" }).where(eq(reservations.id, rental.reservationId));
  await db.insert(activityLogs).values({ userId: user.id, action: "CHECKIN", entite: "Rental", entiteId: rentalId });

  revalidatePath(`/admin/locations/${rentalId}`);
  revalidatePath("/admin/locations");
  revalidatePath("/admin");
  redirect(`/admin/locations/${rentalId}`);
}

export async function submitCheckOut(rentalId: string, _prev: RentalFormState, fd: FormData): Promise<RentalFormState> {
  const user = await requirePermission("rental", "write");
  const rental = await db.query.rentals.findFirst({ where: eq(rentals.id, rentalId), with: { vehicle: true } });
  if (!rental) return { error: "Location introuvable." };
  const checkIn = await db.query.checkIns.findFirst({ where: eq(checkIns.rentalId, rentalId) });

  const checklist: Record<string, boolean> = {};
  for (const it of CHECKOUT_ITEMS) checklist[it.key] = fd.get(`chk_${it.key}`) === "on";

  const km = Number(fd.get("km")) || 0;
  const carburant = Number(fd.get("carburant"));
  const now = new Date();

  let photos: Record<string, string>;
  try {
    photos = await collectPhotos(fd, `rentals/${rentalId}/checkout`);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erreur lors de l'envoi des photos." };
  }

  const v = rental.vehicle;
  const kmDepart = rental.kmDepart ?? checkIn?.km ?? km;
  const carbDepart = rental.carburantDepart ?? checkIn?.carburant ?? carburant;
  const jours = daysBetween(rental.dateDepart, rental.dateRetour);
  const kmInclus = (v?.kmInclusJour ?? 0) * jours;

  const kmParcourus = Math.max(0, km - kmDepart);
  const kmSupp = Math.max(0, kmParcourus - kmInclus);
  const fraisKm = Math.round(kmSupp * (v?.prixKmSupp ?? 0));

  const joursRetard = now > new Date(rental.dateRetour) ? daysBetween(rental.dateRetour, now) : 0;
  const fraisRetard = Math.round(joursRetard * (v?.prixJour ?? 0));

  const carbManquant = Math.max(0, (carbDepart ?? 100) - carburant);
  const fraisCarburant = Math.round(carbManquant * FUEL_EUR_PER_PCT);

  const totalFrais = fraisKm + fraisRetard + fraisCarburant;

  const existing = await db.query.checkOuts.findFirst({ where: eq(checkOuts.rentalId, rentalId) });
  const values = {
    rentalId, checklist: JSON.stringify(checklist), km, carburant, photos: JSON.stringify(photos),
    fraisKm, fraisRetard, fraisCarburant, agentId: user.id, agentNom: user.nom,
  };
  if (existing) await db.update(checkOuts).set(values).where(eq(checkOuts.rentalId, rentalId));
  else await db.insert(checkOuts).values(values);

  await db.update(rentals).set({ statut: "TERMINEE", dateRetourReel: now, kmRetour: km, carburantRetour: carburant, fraisSupp: totalFrais }).where(eq(rentals.id, rentalId));
  await db.update(vehicles).set({ statut: "DISPONIBLE", kilometrage: Math.max(km, v?.kilometrage ?? 0), updatedAt: new Date() }).where(eq(vehicles.id, rental.vehicleId));
  if (rental.reservationId) await db.update(reservations).set({ statut: "TERMINEE" }).where(eq(reservations.id, rental.reservationId));
  await db.update(deposits).set({ statut: "LIBEREE" }).where(eq(deposits.rentalId, rentalId));

  const damageDesc = String(fd.get("damage") || "").trim();
  if (damageDesc) {
    await db.insert(vehicleDamages).values({
      vehicleId: rental.vehicleId, rentalId, customerId: rental.customerId,
      zone: "Constaté au retour", description: damageDesc, photos: JSON.stringify(Object.values(photos)),
      statut: "NOUVEAU", impute: "A_DEFINIR",
    });
  }

  await db.insert(notifications).values({
    type: "RETOUR",
    message: `Retour ${rental.reference} — frais supplémentaires : ${totalFrais} €`,
    lien: `/admin/locations/${rentalId}`,
  });
  await db.insert(activityLogs).values({ userId: user.id, action: "CHECKOUT", entite: "Rental", entiteId: rentalId });

  revalidatePath(`/admin/locations/${rentalId}`);
  revalidatePath("/admin/locations");
  revalidatePath("/admin");
  redirect(`/admin/locations/${rentalId}`);
}
