# APEX — Plateforme de gestion & showroom digital pour véhicules d'exception

> **Document d'architecture & plan de développement — V1**
> Nom de marque « APEX » utilisé comme nom de travail (facile à remplacer partout). Alternatives possibles : OCTANE, MERIDIAN, VELOCE, REDLINE.
> Cadre : **Luxembourg** — TVA 17 %, RGPD, documents au format luxembourgeois.
> Direction artistique validée : **noir profond / carbone / anthracite**, accent **orange incandescent**, interface et contenus **en français**.

---

## 0. Résumé exécutif

APEX n'est pas un site vitrine, c'est une **plateforme métier** en deux blocs qui partagent une seule base de données et un seul modèle de véhicule :

1. **Le showroom digital public** — une expérience cinématique, sombre et rapide, pensée pour provoquer le désir avant même l'affichage du prix.
2. **Le back-office (« Cockpit »)** — un outil opérationnel complet couvrant tout le cycle de vie d'un véhicule : achat → préparation → location(s) → revente, avec CRM, planning, contrats PDF, états des lieux mobiles, maintenance et reporting financier.

Le fil conducteur technique : **un véhicule est une entité unique** qui traverse plusieurs activités (acquisition, location, vente) tout en conservant tout son historique. Tout le modèle de données est construit autour de ce principe.

---

## 1. Positionnement de marque

| Axe | Traduction concrète dans le produit |
|---|---|
| Vitesse / adrénaline | Animations d'accélération (départ contrôlé → accélération → arrêt fluide), chiffres de performance animés, lignes de vitesse. |
| Luxe / exclusivité | Noir profond, espaces négatifs généreux, typographie monumentale, accent orange rare. |
| Rareté | Peu de véhicules montrés à la fois, format « une voiture par écran », vocabulaire « collection » plutôt que « stock ». |
| Crédibilité | Fiches techniques réelles, aucun effet tuning/gaming, cohérence de grille et de rythme. |

**Univers sémantique** (FR, puisque tout est en français) — bibliothèque de slogans courts et percutants :
- CONDUIRE L'EXCEPTION
- LIBÉREZ LA MACHINE
- LA PERFORMANCE N'A PAS DE LIMITE
- CONÇUE POUR ÊTRE PILOTÉE
- VOTRE PROCHAIN DÉPART COMMENCE ICI
- CERTAINES VOITURES MÉRITENT D'ÊTRE À VOUS
- PAS BESOIN DE LA POSSÉDER POUR LA VIVRE

**Deux CTA principaux** partout : `LOUER L'EXPÉRIENCE` et `VOITURES À VENDRE`.

---

## 2. Architecture fonctionnelle (vue d'ensemble)

```
                     ┌────────────────────────────────────────────┐
                     │                 UTILISATEURS                │
                     └───────────────┬───────────────┬────────────┘
                        Visiteurs    │               │  Équipe interne
                                     ▼               ▼
           ┌──────────────────────────────┐   ┌──────────────────────────────┐
           │        SITE PUBLIC           │   │   BACK-OFFICE « COCKPIT »    │
           │  (showroom cinématique)      │   │  (authentifié, par rôle)     │
           │                              │   │                              │
           │ Accueil · Vente · Location   │   │ Dashboard · Flotte · Ventes  │
           │ Fiche véhicule · Réservation │   │ Locations · Planning · CRM   │
           │ Essai · Contact · Entreprise │   │ Check-in/out · Contrats ...  │
           └───────────────┬──────────────┘   └───────────────┬──────────────┘
                           │        API / Server Actions       │
                           └──────────────────┬────────────────┘
                                              ▼
                        ┌──────────────────────────────────────┐
                        │      COUCHE MÉTIER (services)          │
                        │  Flotte · Location · Vente · Facturation│
                        │  Disponibilité · Documents · Notifs     │
                        └──────────────────┬─────────────────────┘
                                           ▼
             ┌────────────────┬──────────────────────┬─────────────────────┐
             │  PostgreSQL    │  Stockage objets     │  Services externes  │
             │  (Prisma)      │  (photos/documents   │  Email · SMS · PDF  │
             │                │   privés & publics)  │  Paiement · Signature│
             └────────────────┴──────────────────────┴─────────────────────┘
```

Principe clé : le back-office est **modulaire** — chaque module (Locations, Maintenance, Dommages…) est un dossier autonome (route + composants + service + accès). Ajouter un module = ajouter un dossier, pas refondre l'existant.

---

## 3. Pages du site public

| Page | Rôle | Points forts UX / animation |
|---|---|---|
| **Accueil** | Narration visuelle complète (voir §5 du brief) | Hero plein écran, featured cars scroll-driven, chiffres animés, sections location/vente, CTA final. |
| **Voitures à vendre** | Catalogue « à vendre » | Vues Grid premium + Immersive (une voiture/écran). Filtres. |
| **Voitures à louer** | Catalogue « à louer » | Idem + affichage prix/jour, disponibilité. |
| **Fiche véhicule** | Landing page par voiture | Hero photo/vidéo, galerie immersive, bloc performance graphique, CTA contextuel (réserver / demander infos / essai). |
| **Réservation** | Formulaire de location | Sélection dates, options, caution, calcul prix live, vérif disponibilité. Panneau latéral premium. |
| **Demande d'essai** | Test drive | Formulaire court, choix créneau. |
| **Demande d'information** | Lead vente | Formulaire contextualisé au véhicule. |
| **Contact** | Coordonnées + formulaire | Carte, horaires. |
| **L'entreprise** | Présentation / storytelling | Section éditoriale cinématique. |
| Mentions légales / RGPD / CGV / CGL | Conformité LU | Pages statiques. |

**Transitions de pages** : au clic sur une voiture, la photo sélectionnée s'agrandit jusqu'à devenir le hero de la fiche (shared-element transition, dégradation propre si `prefers-reduced-motion`).

---

## 4. Pages / modules du back-office (« Cockpit »)

Groupés par domaine pour la navigation :

**Pilotage**
- Dashboard (cockpit performance : flotte, en route, disponibles, service, CA, taux d'occupation, alertes)
- Reporting & Finances (CA location/vente, marge, rentabilité/véhicule, ROI, TCO, taux d'occupation)
- Notifications & alertes

**Flotte**
- Gestion de la flotte (liste + fiche véhicule 360°)
- Véhicules à vendre / Véhicules de location (vues filtrées de la flotte)
- Maintenance (échéances, alertes date/km, coûts)
- Dépenses (rattachées ou non à un véhicule)

**Commercial — Vente**
- Achats (acquisition + coûts → coût de revient)
- Ventes (prix, marge, acheteur, documents)
- Pipeline de vente (Kanban)
- Prospects (leads vente)

**Commercial — Location**
- Réservations
- Locations (contrats en cours / historique)
- Planning de flotte (jour / semaine / mois)
- Cautions & paiements

**Opérations terrain**
- Check-in (avant location, mobile-first)
- Check-out / Retour (comparaison automatique)
- États des lieux & inspections
- Dommages (workflow dédié)
- Sinistres

**Relation client**
- Clients (CRM, documents KYC sécurisés)
- Contrats & Documents (génération PDF, signature, archivage)

**Administration**
- Utilisateurs & rôles / permissions
- Journal d'activité (audit log)
- Paramètres (société, TVA, tarifs, modèles de documents, conditions)

---

## 5. Modèle de données

### 5.1 Vue relationnelle (entités et liens principaux)

```
User ─< ActivityLog
User >─ Role (RBAC)

Vehicle ─1─< VehiclePhoto
Vehicle ─1─< VehicleDocument
Vehicle ─1─< VehicleExpense
Vehicle ─1─< VehicleMaintenance
Vehicle ─1─< VehicleDamage
Vehicle ─1─0..1 Purchase           (comment il est entré en flotte)
Vehicle ─1─< Sale                  (mise(s) en vente / vente)
Vehicle ─1─< Reservation
Vehicle ─1─< Rental
Vehicle ─1─< StatusHistory         (traçabilité des changements d'état)

Customer ─1─< Reservation
Customer ─1─< Rental
Customer ─1─< Sale
Customer ─1─< Payment
Customer ─1─< CustomerDocument (KYC : permis, CNI — stockage privé chiffré)

Lead ─0..1─ Vehicle                 (véhicule d'intérêt)
Lead ─0..1─ Customer                (conversion prospect → client)

Reservation ─1─0..1 Rental          (une réservation confirmée devient location)
Rental ─1─0..1 CheckIn
Rental ─1─0..1 CheckOut
Rental ─1─< Payment
Rental ─1─0..1 Deposit
Rental ─1─< VehicleDamage           (dommages constatés sur cette location)
Rental ─1─< Contract

Sale ─1─< Payment
Sale ─1─< Contract

CheckIn / CheckOut ─1─0..1 Inspection ─1─< InspectionPhoto
Contract ─1─1 Document (PDF généré : contrat, EDL, facture, reçu…)
Notification >─ (Rental | Sale | Vehicle | Payment | …)  (polymorphe léger)
```

### 5.2 Entités détaillées (champs principaux)

**Vehicle** — cœur du système
`id, refInterne, marque, modele, version, finition, annee, premiereImmat, vin, plaque, kilometrage, carburant(enum), puissanceCh, coupleNm, cylindree, accel0100, vitesseMax, boite(enum), transmission(enum), portes, places, couleurExt, couleurInt, carrosserie(enum), normeEuro, co2, equipements(json), options(json), description, statut(enum), destinationActuelle(enum: vente|location|les_deux), prixAffiche, prixSouhaite, createdAt, updatedAt`

*Statuts* : `EN_ACQUISITION, EN_PREPARATION, DISPONIBLE, A_VENDRE, A_LOUER, RESERVE, LOUE, VENDU, EN_MAINTENANCE, INDISPONIBLE`.
Un véhicule change d'activité sans perdre son historique → **StatusHistory** journalise chaque transition (ancien statut, nouveau, raison, utilisateur, date).

**RentalPricing** (1–1 avec Vehicle, ou table dédiée) — `prixJour, prixWeekend, prixSemaine, prixLongueDuree, kmInclusJour, prixKmSupp, montantCaution, ageMin, anciennetePermisMin, conditions, territoireAutorise`.

**Purchase** — `vehicleId, dateAchat, fournisseur, prixAchat, tva, fraisAdmin, transport, immatriculation, preparation, entretien, reparations, carrosserie, detailing, pneus, autresFrais, coutRevientTotal(calculé)`.

**Sale** — `vehicleId, customerId, prixAffiche, prixSouhaite, prixNegocie, prixFinal, acompte, solde, modePaiement, dateVente, statutPipeline(enum), margeBrute(calc), margeReelle(calc), dureeEnStock(calc)`.

**Reservation** — `vehicleId, customerId, dateDepart, dateRetour, prix, options(json), remise, montantCaution, statut(enum), source`.
*Statuts* : `DEMANDE, OPTION, CONFIRMEE, PAYEE, EN_PREPARATION, PRETE, REMISE, EN_COURS, RETOUR_ATTENDU, TERMINEE, ANNULEE, LITIGE`.

**Rental** — instance opérationnelle d'une réservation confirmée : `reservationId, vehicleId, customerId, dateDepartReelle, dateRetourReelle, kmDepart, kmRetour, carburantDepart, carburantRetour, fraisSupplementaires(json), total`.

**Customer** — `type(particulier|societe), nom, prenom, societe, adresse, tel, email, dateNaissance, numeroPermis, permisDelivreLe, permisExpireLe, numeroCNI, notes`.
**CustomerDocument** — `customerId, type(permis|cni|autre), fichierPrive(url signé), uploadedAt` → **jamais accessible publiquement**.

**Lead** — `source, vehicleId?, activite(vente|location), dateContact, statut, prochaineRelance, notes, customerId?`.

**Payment** — `montant, type(location|vente|caution|frais), methode, statut, date, rentalId?, saleId?, customerId`.
**Deposit** (caution) — `rentalId, montant, statut(bloquee|liberee|retenue_partielle|retenue_totale), dateBlocage, dateLiberation`.

**CheckIn / CheckOut** — `rentalId, checklist(json), km, carburant, batterie, pressionPneus, etatPneus, proprete, accessoires, cles, signatureClient(url), agentId, timestamp`.
**Inspection** — état des lieux structuré ; **InspectionPhoto** — `zone(avant|arriere|gauche|droite|interieur|jantes|parebrise|moteur…), url, damageFlag`.

**VehicleDamage** — `vehicleId, rentalId?, customerId?, date, zone, description, photos(json), estimation, devis, coutFinal, statut(enum), impute(client|assurance|interne)`.
*Statuts* : `NOUVEAU, A_EXPERTISER, DEVIS_DEMANDE, EN_ATTENTE, REPARATION_PLANIFIEE, REPARE, FACTURE_CLIENT, ASSURANCE`.

**VehicleMaintenance** — `vehicleId, type(vidange|pneus|freins|entretien|CT|assurance|taxe|reparation|detailing), date, km, cout, prochaineEcheanceDate, prochaineEcheanceKm, statut`.
**VehicleExpense** — `vehicleId?, categorie, montant, date, note` (dépense flotte ou générale).

**Contract** — `type(location|edl_depart|edl_retour|vente|bon_commande|facture|recu|caution), rentalId?, saleId?, documentId, statutSignature, envoyeLe`.
**Document** — fichier PDF généré/stocké : `type, url, entiteLiee, hashSignature?, archivedAt`.

**Notification** — `type, cible(userId|role), entiteLiee, message, lu, createdAt`.
**ActivityLog** — `userId, action, entite, entiteId, diff(json), createdAt` (audit RGPD).

### 5.3 Règles métier structurantes
- **Anti-double-réservation** : contrainte applicative + vérification en base sur chevauchement `[dateDepart, dateRetour]` par véhicule (statuts bloquants uniquement).
- **Coût de revient** et **marges** : calculés côté serveur à partir de Purchase + VehicleExpense + Sale, jamais saisis à la main.
- **Comparaison check-in/check-out** : km supplémentaires, retard, carburant/recharge manquants, dommages → génèrent automatiquement des lignes de frais.
- **Cycle de vie** (§32 du brief) tracé via StatusHistory : Achat → Préparation → Shooting → Vente/Location → Publication → Réservation/Prospect → Contrat → Check-in → Location → Check-out → Maintenance → Nouvelle location → Revente.

---

## 6. Rôles & permissions (RBAC)

| Rôle | Périmètre |
|---|---|
| **Administrateur** | Accès complet, paramètres, utilisateurs, suppression. |
| **Gestionnaire** | Flotte, clients, locations, ventes, planning, contrats. Pas de paramètres système ni gestion utilisateurs. |
| **Employé** | Dossiers opérationnels : réservations, check-in/out, états des lieux, dommages. Lecture clients. |
| **Comptabilité** | Finances, paiements, cautions, factures, reporting. Lecture seule sur la flotte. |

Permissions **fines par ressource × action** (`vehicle:read`, `rental:write`, `finance:read`…). Garde côté serveur sur **chaque** action, pas seulement dans l'UI. Toute action sensible → ActivityLog.

---

## 7. Stack technique

| Couche | Choix | Justification |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | SSR/SSG pour le SEO et la perf du site public, Server Actions pour le back-office. |
| Style | **Tailwind CSS** + design tokens (thème sombre/orange) | Rapidité + cohérence de grille. |
| Animation | **GSAP + ScrollTrigger** (scroll-driven), **Framer Motion** (micro-interactions React), **Lenis** (smooth scroll) | GSAP pour les séquences cinématiques ; Motion pour les composants ; toujours GPU-friendly + `prefers-reduced-motion`. |
| Base de données | **PostgreSQL** | Relationnel, transactions, contraintes (anti-double-réservation). |
| ORM | **Prisma** | Typage bout-en-bout, migrations. |
| Auth | **Auth.js (NextAuth v5)** | Sessions, rôles, middleware de protection. |
| Stockage fichiers | **S3-compatible** (public bucket pour photos véhicules / privé + URLs signées pour KYC & contrats) | Séparation stricte public/privé pour le RGPD. |
| PDF | Génération serveur (React-PDF / Playwright→PDF) | Contrats, EDL, factures dynamiques. |
| Emails / SMS | Provider transactionnel (abstrait derrière une interface `Notifier`) | Confirmations, rappels, contrats. |
| Validation | **Zod** (schémas partagés client/serveur) | Formulaires robustes + typage. |
| Data grids / tables | TanStack Table | Listes back-office filtrables/triables. |

---

## 8. Architecture du projet (arborescence cible)

```
apex/
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts                 # données de démo réalistes
├─ src/
│  ├─ app/
│  │  ├─ (public)/            # site public
│  │  │  ├─ page.tsx          # accueil
│  │  │  ├─ vente/ location/ vehicule/[slug]/ ...
│  │  ├─ (admin)/             # back-office, protégé
│  │  │  ├─ dashboard/ flotte/ locations/ planning/
│  │  │  ├─ clients/ ventes/ contrats/ maintenance/ ...
│  │  ├─ api/                 # webhooks, endpoints
│  ├─ modules/                # LOGIQUE MÉTIER par domaine
│  │  ├─ fleet/  rental/  sale/  crm/  billing/
│  │  ├─ inspection/  maintenance/  documents/  notifications/
│  │  │   (chaque module : service.ts, schemas.ts, queries.ts, components/)
│  ├─ components/
│  │  ├─ public/   (Hero, FeaturedScroll, PerfCounters, CarCard…)
│  │  ├─ admin/    (DataTable, KanbanBoard, PlanningCalendar…)
│  │  └─ ui/       (design system : Button, Panel, Stat…)
│  ├─ lib/         (auth, db, storage, pdf, mailer, rbac, money, dates)
│  └─ styles/      (tokens, tailwind config)
└─ ...
```

---

## 9. Périmètre MVP vs V2

### MVP (première version réellement utilisable en production)
Suit strictement l'ordre de priorité du brief (§34) :
1. **Base technique** — Next.js, Tailwind, tokens DA, layout public/admin.
2. **Base de données** — schéma Prisma complet + seed réaliste.
3. **Authentification & rôles** — login, sessions, RBAC, protection des routes.
4. **Gestion de la flotte** — CRUD véhicule, photos, statuts, StatusHistory.
5. **Site public** — accueil cinématique, catalogues vente/location, fiche véhicule, filtres, formulaires (réservation, essai, info) connectés à la base.
6. **Locations** — réservation, anti-double-réservation, tarifs, statuts, cautions.
7. **Planning de flotte** — vues jour/semaine/mois, clic → dossier.
8. **Clients (CRM)** — fiches, documents KYC sécurisés, historique.
9. **Check-in / Check-out** — mobile-first, checklist, photos, comparaison auto.
10. **Contrats** — génération PDF (contrat location, EDL départ/retour, facture), archivage.

### V2 (extensions)
- **Vente automobile avancée** — pipeline Kanban complet, calculs de marge/rentabilité détaillés.
- **Maintenance** — échéancier, alertes date/km, coût total par véhicule.
- **Finances & Reporting** — CA, marge, ROI, TCO, taux d'occupation, revenu/jour loué.
- **Dommages & Sinistres** — workflow complet + imputation client/assurance.
- **Signature électronique** intégrée, envoi email/SMS automatisé (confirmations, rappels, avis).
- **Notifications automatiques** (départs/retours du jour, retards, cautions, documents expirés).
- **Transitions de pages** shared-element avancées, vidéos hero optimisées, i18n si besoin d'international.

---

## 10. Plan de développement (phasé)

| Phase | Contenu | Livrable vérifiable |
|---|---|---|
| **0. Fondations** | Setup Next.js/TS/Tailwind, tokens DA (orange incandescent), design system de base, arborescence modules. | App qui démarre, thème sombre appliqué. |
| **1. Données & Auth** | Schéma Prisma, migrations, seed réaliste (12 véhicules, clients, locations). Auth.js + RBAC + middleware. | Login fonctionnel par rôle, données en base. |
| **2. Flotte** | CRUD véhicule complet, upload photos, statuts + StatusHistory, vues « à vendre / à louer ». | Créer/éditer un véhicule et le voir changer d'état. |
| **3. Site public** | Accueil cinématique, catalogues + filtres, fiche véhicule, formulaires connectés (réservation/essai/info → base). | Un visiteur réserve/demande, ça arrive dans le back-office. |
| **4. Location & Planning** | Réservations, anti-double-réservation, tarifs, cautions, planning jour/semaine/mois. | Impossible de double-réserver ; planning à jour. |
| **5. Clients & Terrain** | CRM + KYC sécurisé ; check-in/check-out mobile ; états des lieux photo ; comparaison auto. | Cycle location complet remise → retour avec frais calculés. |
| **6. Contrats** | Génération PDF (contrat, EDL, facture, reçu, caution), archivage, téléchargement. | PDF conformes générés depuis un dossier réel. |
| **7. V2** | Vente/pipeline, maintenance, finances/reporting, dommages, notifications, signature. | Modules livrés un par un. |

**Méthode** : développement **module par module**, chaque fonctionnalité livrée avec validation des formulaires (Zod), gestion d'erreurs, permissions serveur, états de chargement, états vides, responsive et sécurité. Données de démo réalistes dès le départ, **réellement connectées à la base** (pas de maquette à fausses données).

**Garde-fou demandé** : une fois la direction artistique validée sur le prototype, on gèle la DA et on implémente le MVP sans la modifier.

---

## 11. Sécurité & conformité (Luxembourg / RGPD)

- Authentification sécurisée, sessions, RBAC serveur, rate-limiting sur les formulaires publics.
- **Documents clients (permis, CNI) chiffrés, bucket privé, accès par URL signée à durée limitée** — jamais d'URL publique.
- Journal d'activité (ActivityLog) pour l'audit et la traçabilité.
- TVA 17 % paramétrable ; modèles de contrats/factures conformes au cadre luxembourgeois (à faire valider par un juriste avant production).
- RGPD : consentement, droit à l'effacement, minimisation, durée de conservation des documents KYC paramétrable.
- Sauvegardes régulières de la base et du stockage.

---

## 12. Prochaine étape

Le **prototype visuel de la homepage** (fichier HTML autonome) accompagne ce plan pour valider la direction artistique — noir/carbone, accent orange, slogans FR, animations d'accélération au scroll. Une fois la DA validée et ce plan approuvé (ou ajusté), je démarre la **Phase 0 → 2** du MVP.
