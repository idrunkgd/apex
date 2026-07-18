import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

const id = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());
const now = () => integer("created_at", { mode: "timestamp_ms" }).$defaultFn(() => new Date());

// ------------------------------------------------------------------ Users
export const users = sqliteTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  nom: text("nom").notNull(),
  role: text("role").notNull().default("EMPLOYE"),
  actif: integer("actif", { mode: "boolean" }).notNull().default(true),
  createdAt: now(),
});

export const activityLogs = sqliteTable("activity_logs", {
  id: id(),
  userId: text("user_id"),
  action: text("action").notNull(),
  entite: text("entite").notNull(),
  entiteId: text("entite_id"),
  detail: text("detail"),
  createdAt: now(),
});

// ------------------------------------------------------------------ Vehicles
export const vehicles = sqliteTable("vehicles", {
  id: id(),
  refInterne: text("ref_interne").notNull().unique(),
  slug: text("slug").notNull().unique(),
  marque: text("marque").notNull(),
  modele: text("modele").notNull(),
  version: text("version"),
  finition: text("finition"),
  annee: integer("annee").notNull(),
  premiereImmat: integer("premiere_immat", { mode: "timestamp_ms" }),
  vin: text("vin"),
  plaque: text("plaque"),
  kilometrage: integer("kilometrage").notNull().default(0),
  carburant: text("carburant").notNull().default("ESSENCE"),
  puissanceCh: integer("puissance_ch").notNull(),
  coupleNm: integer("couple_nm"),
  cylindree: integer("cylindree"),
  accel0100: real("accel_0100"),
  vitesseMax: integer("vitesse_max"),
  boite: text("boite").notNull().default("AUTO"),
  transmission: text("transmission").notNull().default("PROPULSION"),
  portes: integer("portes").notNull().default(2),
  places: integer("places").notNull().default(2),
  couleurExt: text("couleur_ext"),
  couleurInt: text("couleur_int"),
  carrosserie: text("carrosserie").notNull().default("COUPE"),
  normeEuro: text("norme_euro"),
  co2: integer("co2"),
  moteur: text("moteur"),
  equipements: text("equipements"),
  options: text("options"),
  description: text("description"),
  statut: text("statut").notNull().default("DISPONIBLE"),
  destination: text("destination").notNull().default("LES_DEUX"),
  vedette: integer("vedette", { mode: "boolean" }).notNull().default(false),
  prixAffiche: real("prix_affiche"),
  prixSouhaite: real("prix_souhaite"),
  prixJour: real("prix_jour"),
  prixWeekend: real("prix_weekend"),
  prixSemaine: real("prix_semaine"),
  prixLongueDuree: real("prix_longue_duree"),
  kmInclusJour: integer("km_inclus_jour"),
  prixKmSupp: real("prix_km_supp"),
  caution: real("caution"),
  ageMin: integer("age_min"),
  anciennetePermis: integer("anciennete_permis"),
  createdAt: now(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).$defaultFn(() => new Date()),
});

export const vehiclePhotos = sqliteTable("vehicle_photos", {
  id: id(),
  vehicleId: text("vehicle_id").notNull(),
  url: text("url").notNull().default(""),
  categorie: text("categorie").notNull().default("EXTERIEUR"),
  ordre: integer("ordre").notNull().default(0),
  cover: integer("cover", { mode: "boolean" }).notNull().default(false),
});

export const vehicleExpenses = sqliteTable("vehicle_expenses", {
  id: id(),
  vehicleId: text("vehicle_id"),
  categorie: text("categorie").notNull(),
  montant: real("montant").notNull(),
  date: now(),
  note: text("note"),
});

export const vehicleMaintenance = sqliteTable("vehicle_maintenance", {
  id: id(),
  vehicleId: text("vehicle_id").notNull(),
  type: text("type").notNull(),
  date: integer("date", { mode: "timestamp_ms" }).$defaultFn(() => new Date()),
  km: integer("km"),
  cout: real("cout"),
  prochaineDate: integer("prochaine_date", { mode: "timestamp_ms" }),
  prochainKm: integer("prochain_km"),
  statut: text("statut").notNull().default("PLANIFIE"),
  note: text("note"),
});

export const vehicleDamages = sqliteTable("vehicle_damages", {
  id: id(),
  vehicleId: text("vehicle_id").notNull(),
  rentalId: text("rental_id"),
  customerId: text("customer_id"),
  date: now(),
  zone: text("zone").notNull(),
  description: text("description"),
  photos: text("photos"),
  estimation: real("estimation"),
  coutFinal: real("cout_final"),
  statut: text("statut").notNull().default("NOUVEAU"),
  impute: text("impute").notNull().default("A_DEFINIR"),
});

export const statusHistory = sqliteTable("status_history", {
  id: id(),
  vehicleId: text("vehicle_id").notNull(),
  ancienStatut: text("ancien_statut"),
  nouveauStatut: text("nouveau_statut").notNull(),
  raison: text("raison"),
  createdAt: now(),
});

// ------------------------------------------------------------------ Customers / CRM
export const customers = sqliteTable("customers", {
  id: id(),
  type: text("type").notNull().default("PARTICULIER"),
  nom: text("nom").notNull(),
  prenom: text("prenom"),
  societe: text("societe"),
  email: text("email"),
  telephone: text("telephone"),
  adresse: text("adresse"),
  dateNaissance: integer("date_naissance", { mode: "timestamp_ms" }),
  numeroPermis: text("numero_permis"),
  permisDelivre: integer("permis_delivre", { mode: "timestamp_ms" }),
  permisExpire: integer("permis_expire", { mode: "timestamp_ms" }),
  numeroCNI: text("numero_cni"),
  notes: text("notes"),
  createdAt: now(),
});

export const customerDocuments = sqliteTable("customer_documents", {
  id: id(),
  customerId: text("customer_id").notNull(),
  type: text("type").notNull(),
  url: text("url").notNull(),
  createdAt: now(),
});

export const leads = sqliteTable("leads", {
  id: id(),
  source: text("source"),
  activite: text("activite").notNull().default("VENTE"),
  vehicleId: text("vehicle_id"),
  customerId: text("customer_id"),
  nom: text("nom").notNull(),
  email: text("email"),
  telephone: text("telephone"),
  message: text("message"),
  statut: text("statut").notNull().default("NOUVEAU"),
  prochaineRelance: integer("prochaine_relance", { mode: "timestamp_ms" }),
  createdAt: now(),
});

// ------------------------------------------------------------------ Purchase / Sale
export const purchases = sqliteTable("purchases", {
  id: id(),
  vehicleId: text("vehicle_id").notNull().unique(),
  dateAchat: now(),
  fournisseur: text("fournisseur"),
  prixAchat: real("prix_achat").notNull(),
  tva: real("tva"),
  fraisAdmin: real("frais_admin").default(0),
  transport: real("transport").default(0),
  immatriculation: real("immatriculation").default(0),
  preparation: real("preparation").default(0),
  entretien: real("entretien").default(0),
  reparations: real("reparations").default(0),
  carrosserie: real("carrosserie").default(0),
  detailing: real("detailing").default(0),
  pneus: real("pneus").default(0),
  autresFrais: real("autres_frais").default(0),
  note: text("note"),
});

export const sales = sqliteTable("sales", {
  id: id(),
  vehicleId: text("vehicle_id").notNull(),
  customerId: text("customer_id"),
  statut: text("statut").notNull().default("PROSPECT"),
  prixAffiche: real("prix_affiche"),
  prixNegocie: real("prix_negocie"),
  prixFinal: real("prix_final"),
  acompte: real("acompte"),
  modePaiement: text("mode_paiement"),
  dateVente: integer("date_vente", { mode: "timestamp_ms" }),
  createdAt: now(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).$defaultFn(() => new Date()),
});

// ------------------------------------------------------------------ Location
export const reservations = sqliteTable("reservations", {
  id: id(),
  reference: text("reference").notNull().unique(),
  vehicleId: text("vehicle_id").notNull(),
  customerId: text("customer_id"),
  contactNom: text("contact_nom"),
  contactEmail: text("contact_email"),
  contactTel: text("contact_tel"),
  dateDepart: integer("date_depart", { mode: "timestamp_ms" }).notNull(),
  dateRetour: integer("date_retour", { mode: "timestamp_ms" }).notNull(),
  prixTotal: real("prix_total"),
  caution: real("caution"),
  remise: real("remise").default(0),
  options: text("options"),
  statut: text("statut").notNull().default("DEMANDE"),
  source: text("source").notNull().default("SITE"),
  note: text("note"),
  createdAt: now(),
});

export const rentals = sqliteTable("rentals", {
  id: id(),
  reference: text("reference").notNull().unique(),
  reservationId: text("reservation_id").unique(),
  vehicleId: text("vehicle_id").notNull(),
  customerId: text("customer_id"),
  dateDepart: integer("date_depart", { mode: "timestamp_ms" }).notNull(),
  dateRetour: integer("date_retour", { mode: "timestamp_ms" }).notNull(),
  dateDepartReel: integer("date_depart_reel", { mode: "timestamp_ms" }),
  dateRetourReel: integer("date_retour_reel", { mode: "timestamp_ms" }),
  kmDepart: integer("km_depart"),
  kmRetour: integer("km_retour"),
  carburantDepart: integer("carburant_depart"),
  carburantRetour: integer("carburant_retour"),
  total: real("total"),
  fraisSupp: real("frais_supp").default(0),
  statut: text("statut").notNull().default("CONFIRMEE"),
  createdAt: now(),
});

export const checkIns = sqliteTable("check_ins", {
  id: id(),
  rentalId: text("rental_id").notNull().unique(),
  checklist: text("checklist"),
  km: integer("km"),
  carburant: integer("carburant"),
  photos: text("photos"),
  signature: text("signature"),
  agentId: text("agent_id"),
  agentNom: text("agent_nom"),
  createdAt: now(),
});

export const checkOuts = sqliteTable("check_outs", {
  id: id(),
  rentalId: text("rental_id").notNull().unique(),
  checklist: text("checklist"),
  km: integer("km"),
  carburant: integer("carburant"),
  photos: text("photos"),
  fraisKm: real("frais_km").default(0),
  fraisRetard: real("frais_retard").default(0),
  fraisCarburant: real("frais_carburant").default(0),
  agentId: text("agent_id"),
  agentNom: text("agent_nom"),
  createdAt: now(),
});

export const payments = sqliteTable("payments", {
  id: id(),
  montant: real("montant").notNull(),
  type: text("type").notNull(),
  methode: text("methode"),
  statut: text("statut").notNull().default("EN_ATTENTE"),
  date: now(),
  rentalId: text("rental_id"),
  saleId: text("sale_id"),
  customerId: text("customer_id"),
});

export const deposits = sqliteTable("deposits", {
  id: id(),
  rentalId: text("rental_id").notNull().unique(),
  montant: real("montant").notNull(),
  statut: text("statut").notNull().default("BLOQUEE"),
  createdAt: now(),
});

export const contracts = sqliteTable("contracts", {
  id: id(),
  type: text("type").notNull(),
  rentalId: text("rental_id"),
  saleId: text("sale_id"),
  url: text("url"),
  signe: integer("signe", { mode: "boolean" }).notNull().default(false),
  createdAt: now(),
});

export const notifications = sqliteTable("notifications", {
  id: id(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  cibleRole: text("cible_role"),
  lu: integer("lu", { mode: "boolean" }).notNull().default(false),
  lien: text("lien"),
  createdAt: now(),
});

// ------------------------------------------------------------------ Relations
export const vehiclesRelations = relations(vehicles, ({ many, one }) => ({
  photos: many(vehiclePhotos),
  expenses: many(vehicleExpenses),
  maintenance: many(vehicleMaintenance),
  damages: many(vehicleDamages),
  statusLog: many(statusHistory),
  reservations: many(reservations),
  rentals: many(rentals),
  sales: many(sales),
  purchase: one(purchases, { fields: [vehicles.id], references: [purchases.vehicleId] }),
}));

export const vehiclePhotosRelations = relations(vehiclePhotos, ({ one }) => ({
  vehicle: one(vehicles, { fields: [vehiclePhotos.vehicleId], references: [vehicles.id] }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  reservations: many(reservations),
  rentals: many(rentals),
  sales: many(sales),
  payments: many(payments),
  documents: many(customerDocuments),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  vehicle: one(vehicles, { fields: [reservations.vehicleId], references: [vehicles.id] }),
  customer: one(customers, { fields: [reservations.customerId], references: [customers.id] }),
  rental: one(rentals, { fields: [reservations.id], references: [rentals.reservationId] }),
}));

export const rentalsRelations = relations(rentals, ({ one, many }) => ({
  vehicle: one(vehicles, { fields: [rentals.vehicleId], references: [vehicles.id] }),
  customer: one(customers, { fields: [rentals.customerId], references: [customers.id] }),
  reservation: one(reservations, { fields: [rentals.reservationId], references: [reservations.id] }),
  payments: many(payments),
  deposit: one(deposits, { fields: [rentals.id], references: [deposits.rentalId] }),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  vehicle: one(vehicles, { fields: [sales.vehicleId], references: [vehicles.id] }),
  customer: one(customers, { fields: [sales.customerId], references: [customers.id] }),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  vehicle: one(vehicles, { fields: [purchases.vehicleId], references: [vehicles.id] }),
}));
