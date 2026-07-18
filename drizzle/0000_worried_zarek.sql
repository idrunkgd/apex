CREATE TABLE `activity_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`entite` text NOT NULL,
	`entite_id` text,
	`detail` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `check_ins` (
	`id` text PRIMARY KEY NOT NULL,
	`rental_id` text NOT NULL,
	`checklist` text,
	`km` integer,
	`carburant` integer,
	`photos` text,
	`signature` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `check_ins_rental_id_unique` ON `check_ins` (`rental_id`);--> statement-breakpoint
CREATE TABLE `check_outs` (
	`id` text PRIMARY KEY NOT NULL,
	`rental_id` text NOT NULL,
	`checklist` text,
	`km` integer,
	`carburant` integer,
	`photos` text,
	`frais_km` real DEFAULT 0,
	`frais_retard` real DEFAULT 0,
	`frais_carburant` real DEFAULT 0,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `check_outs_rental_id_unique` ON `check_outs` (`rental_id`);--> statement-breakpoint
CREATE TABLE `contracts` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`rental_id` text,
	`sale_id` text,
	`url` text,
	`signe` integer DEFAULT false NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `customer_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`type` text NOT NULL,
	`url` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text DEFAULT 'PARTICULIER' NOT NULL,
	`nom` text NOT NULL,
	`prenom` text,
	`societe` text,
	`email` text,
	`telephone` text,
	`adresse` text,
	`date_naissance` integer,
	`numero_permis` text,
	`permis_delivre` integer,
	`permis_expire` integer,
	`numero_cni` text,
	`notes` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `deposits` (
	`id` text PRIMARY KEY NOT NULL,
	`rental_id` text NOT NULL,
	`montant` real NOT NULL,
	`statut` text DEFAULT 'BLOQUEE' NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `deposits_rental_id_unique` ON `deposits` (`rental_id`);--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text,
	`activite` text DEFAULT 'VENTE' NOT NULL,
	`vehicle_id` text,
	`customer_id` text,
	`nom` text NOT NULL,
	`email` text,
	`telephone` text,
	`message` text,
	`statut` text DEFAULT 'NOUVEAU' NOT NULL,
	`prochaine_relance` integer,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`message` text NOT NULL,
	`cible_role` text,
	`lu` integer DEFAULT false NOT NULL,
	`lien` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`montant` real NOT NULL,
	`type` text NOT NULL,
	`methode` text,
	`statut` text DEFAULT 'EN_ATTENTE' NOT NULL,
	`created_at` integer,
	`rental_id` text,
	`sale_id` text,
	`customer_id` text
);
--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`created_at` integer,
	`fournisseur` text,
	`prix_achat` real NOT NULL,
	`tva` real,
	`frais_admin` real DEFAULT 0,
	`transport` real DEFAULT 0,
	`immatriculation` real DEFAULT 0,
	`preparation` real DEFAULT 0,
	`entretien` real DEFAULT 0,
	`reparations` real DEFAULT 0,
	`carrosserie` real DEFAULT 0,
	`detailing` real DEFAULT 0,
	`pneus` real DEFAULT 0,
	`autres_frais` real DEFAULT 0,
	`note` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `purchases_vehicle_id_unique` ON `purchases` (`vehicle_id`);--> statement-breakpoint
CREATE TABLE `rentals` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`reservation_id` text,
	`vehicle_id` text NOT NULL,
	`customer_id` text,
	`date_depart` integer NOT NULL,
	`date_retour` integer NOT NULL,
	`date_depart_reel` integer,
	`date_retour_reel` integer,
	`km_depart` integer,
	`km_retour` integer,
	`carburant_depart` integer,
	`carburant_retour` integer,
	`total` real,
	`frais_supp` real DEFAULT 0,
	`statut` text DEFAULT 'CONFIRMEE' NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rentals_reference_unique` ON `rentals` (`reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `rentals_reservation_id_unique` ON `rentals` (`reservation_id`);--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`vehicle_id` text NOT NULL,
	`customer_id` text,
	`contact_nom` text,
	`contact_email` text,
	`contact_tel` text,
	`date_depart` integer NOT NULL,
	`date_retour` integer NOT NULL,
	`prix_total` real,
	`caution` real,
	`remise` real DEFAULT 0,
	`options` text,
	`statut` text DEFAULT 'DEMANDE' NOT NULL,
	`source` text DEFAULT 'SITE' NOT NULL,
	`note` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reservations_reference_unique` ON `reservations` (`reference`);--> statement-breakpoint
CREATE TABLE `sales` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`customer_id` text,
	`statut` text DEFAULT 'PROSPECT' NOT NULL,
	`prix_affiche` real,
	`prix_negocie` real,
	`prix_final` real,
	`acompte` real,
	`mode_paiement` text,
	`date_vente` integer,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `status_history` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`ancien_statut` text,
	`nouveau_statut` text NOT NULL,
	`raison` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`nom` text NOT NULL,
	`role` text DEFAULT 'EMPLOYE' NOT NULL,
	`actif` integer DEFAULT true NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `vehicle_damages` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`rental_id` text,
	`customer_id` text,
	`created_at` integer,
	`zone` text NOT NULL,
	`description` text,
	`photos` text,
	`estimation` real,
	`cout_final` real,
	`statut` text DEFAULT 'NOUVEAU' NOT NULL,
	`impute` text DEFAULT 'A_DEFINIR' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `vehicle_expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text,
	`categorie` text NOT NULL,
	`montant` real NOT NULL,
	`created_at` integer,
	`note` text
);
--> statement-breakpoint
CREATE TABLE `vehicle_maintenance` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`type` text NOT NULL,
	`date` integer,
	`km` integer,
	`cout` real,
	`prochaine_date` integer,
	`prochain_km` integer,
	`statut` text DEFAULT 'PLANIFIE' NOT NULL,
	`note` text
);
--> statement-breakpoint
CREATE TABLE `vehicle_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`url` text DEFAULT '' NOT NULL,
	`categorie` text DEFAULT 'EXTERIEUR' NOT NULL,
	`ordre` integer DEFAULT 0 NOT NULL,
	`cover` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` text PRIMARY KEY NOT NULL,
	`ref_interne` text NOT NULL,
	`slug` text NOT NULL,
	`marque` text NOT NULL,
	`modele` text NOT NULL,
	`version` text,
	`finition` text,
	`annee` integer NOT NULL,
	`premiere_immat` integer,
	`vin` text,
	`plaque` text,
	`kilometrage` integer DEFAULT 0 NOT NULL,
	`carburant` text DEFAULT 'ESSENCE' NOT NULL,
	`puissance_ch` integer NOT NULL,
	`couple_nm` integer,
	`cylindree` integer,
	`accel_0100` real,
	`vitesse_max` integer,
	`boite` text DEFAULT 'AUTO' NOT NULL,
	`transmission` text DEFAULT 'PROPULSION' NOT NULL,
	`portes` integer DEFAULT 2 NOT NULL,
	`places` integer DEFAULT 2 NOT NULL,
	`couleur_ext` text,
	`couleur_int` text,
	`carrosserie` text DEFAULT 'COUPE' NOT NULL,
	`norme_euro` text,
	`co2` integer,
	`moteur` text,
	`equipements` text,
	`options` text,
	`description` text,
	`statut` text DEFAULT 'DISPONIBLE' NOT NULL,
	`destination` text DEFAULT 'LES_DEUX' NOT NULL,
	`vedette` integer DEFAULT false NOT NULL,
	`prix_affiche` real,
	`prix_souhaite` real,
	`prix_jour` real,
	`prix_weekend` real,
	`prix_semaine` real,
	`prix_longue_duree` real,
	`km_inclus_jour` integer,
	`prix_km_supp` real,
	`caution` real,
	`age_min` integer,
	`anciennete_permis` integer,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vehicles_ref_interne_unique` ON `vehicles` (`ref_interne`);--> statement-breakpoint
CREATE UNIQUE INDEX `vehicles_slug_unique` ON `vehicles` (`slug`);