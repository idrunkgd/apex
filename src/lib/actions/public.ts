"use server";
import { z } from "zod";
import { and, eq, inArray, lt, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { reservations, leads, notifications, vehicles } from "@/db/schema";
import { daysBetween } from "@/lib/format";

const BLOCKING = ["CONFIRMEE", "PAYEE", "EN_PREPARATION", "PRETE", "REMISE", "EN_COURS", "RETOUR_ATTENDU"];

function ref(prefix: string) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}${Date.now().toString().slice(-3)}`;
}

const reservationSchema = z.object({
  vehicleId: z.string().min(1),
  dateDepart: z.string().min(1, "Date de départ requise"),
  dateRetour: z.string().min(1, "Date de retour requise"),
  nom: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  telephone: z.string().min(6, "Téléphone requis"),
  message: z.string().optional(),
});

export type FormState = { ok?: boolean; error?: string; reference?: string; fieldErrors?: Record<string, string> };

export async function createReservation(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = reservationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    parsed.error.issues.forEach((i) => (fe[String(i.path[0])] = i.message));
    return { error: "Merci de corriger les champs indiqués.", fieldErrors: fe };
  }
  const d = parsed.data;
  const depart = new Date(d.dateDepart);
  const retour = new Date(d.dateRetour);
  if (retour <= depart) return { error: "La date de retour doit être après le départ.", fieldErrors: { dateRetour: "Date invalide" } };

  const vehicle = await db.query.vehicles.findFirst({ where: eq(vehicles.id, d.vehicleId) });
  if (!vehicle) return { error: "Véhicule introuvable." };

  // Anti-double-réservation : chevauchement avec une réservation bloquante
  const overlaps = await db
    .select({ id: reservations.id })
    .from(reservations)
    .where(
      and(
        eq(reservations.vehicleId, d.vehicleId),
        inArray(reservations.statut, BLOCKING),
        lt(reservations.dateDepart, retour),
        gt(reservations.dateRetour, depart),
      ),
    );
  if (overlaps.length > 0) {
    return { error: "Ce véhicule est déjà réservé sur cette période. Choisissez d'autres dates." };
  }

  const jours = daysBetween(depart, retour);
  const prixTotal = vehicle.prixJour ? Math.round(vehicle.prixJour * jours) : null;

  const reference = ref("RES");
  await db.insert(reservations).values({
    reference,
    vehicleId: d.vehicleId,
    contactNom: d.nom,
    contactEmail: d.email,
    contactTel: d.telephone,
    dateDepart: depart,
    dateRetour: retour,
    prixTotal,
    caution: vehicle.caution,
    statut: "DEMANDE",
    source: "SITE",
    note: d.message,
  });
  await db.insert(notifications).values({
    type: "RESERVATION",
    message: `Nouvelle demande de réservation ${reference} — ${vehicle.marque} ${vehicle.modele}`,
    lien: "/admin/reservations",
  });

  return { ok: true, reference };
}

const leadSchema = z.object({
  vehicleId: z.string().optional(),
  type: z.string().optional(), // INFO | ESSAI | CONTACT
  nom: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  telephone: z.string().optional(),
  message: z.string().optional(),
});

export async function createLead(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = leadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    parsed.error.issues.forEach((i) => (fe[String(i.path[0])] = i.message));
    return { error: "Merci de corriger les champs indiqués.", fieldErrors: fe };
  }
  const d = parsed.data;
  const type = d.type || "CONTACT";
  const source = type === "ESSAI" ? "Demande d'essai" : type === "INFO" ? "Demande d'information" : "Contact";

  await db.insert(leads).values({
    activite: "VENTE",
    vehicleId: d.vehicleId || null,
    source,
    nom: d.nom,
    email: d.email,
    telephone: d.telephone,
    message: d.message,
    statut: "NOUVEAU",
  });
  await db.insert(notifications).values({
    type: "LEAD",
    message: `Nouveau contact (${source}) — ${d.nom}`,
    lien: "/admin/prospects",
  });

  return { ok: true };
}
