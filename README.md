# APEX — Plateforme véhicules d'exception

Application web complète pour une entreprise de voitures de luxe, sportives et supercars :
**site public immersif** (showroom digital) + **back-office métier** (« Cockpit »).

Stack : **Next.js 15 (App Router) · TypeScript · Tailwind CSS · Drizzle ORM · SQLite/libSQL**.
Direction artistique : noir / carbone, accent **orange incandescent**, interface en français, cadre **Luxembourg** (TVA 17 %).

---

## 🚀 Démarrage

Prérequis : Node.js 20+ (testé sur Node 22).

```bash
npm install          # installe les dépendances
npm run setup        # génère la base SQLite, applique le schéma et charge les données de démo
npm run dev          # démarre le serveur de développement
```

Ouvrez ensuite http://localhost:3000

> `npm run setup` = `drizzle-kit generate` + migration + seed. À ne lancer qu'une fois (ou pour réinitialiser).

### Build de production

```bash
npm run build
npm start
```

---

## 🔐 Comptes de démonstration

Page de connexion : **/login** — mot de passe commun : `apex1234`

| Email | Rôle | Accès |
|---|---|---|
| `admin@apex.lu` | Administrateur | Accès complet |
| `gestion@apex.lu` | Gestionnaire | Flotte, clients, locations, ventes |
| `employe@apex.lu` | Employé | Opérationnel, réservations |
| `compta@apex.lu` | Comptabilité | Finances, paiements |

---

## 🗺️ Pages livrées

**Site public**
- `/` — Accueil cinématique (hero, en vedette, chiffres animés, location/vente, flotte, CTA)
- `/vente` — Catalogue des véhicules à vendre (filtres marque, carburant, carrosserie, tri)
- `/location` — Catalogue des véhicules à louer
- `/vehicule/[slug]` — Fiche détaillée (hero, galerie, fiche technique, réservation ou demande d'info/essai)
- `/contact` · `/entreprise`

**Back-office `/admin`** (authentifié, par rôle)
- Dashboard cockpit (flotte, sur la route, disponibles, CA, taux d'occupation, alertes, départs/retours)
- Gestion de la flotte + fiche véhicule 360° (coût de revient, marge, historique de statut, réservations)
- Réservations · Locations · Planning (14 jours) · Pipeline de vente (Kanban) · Clients (CRM)

Les formulaires publics (réservation, essai, information) **écrivent réellement en base** et remontent dans le back-office. L'**anti-double-réservation** est actif (contrôle de chevauchement de dates).

---

## 🧱 Architecture

```
src/
├─ app/
│  ├─ (public)/        site public (layout + pages)
│  ├─ admin/           back-office (layout protégé + pages)
│  ├─ login/           authentification
│  └─ layout.tsx       layout racine (polices, styles)
├─ components/
│  ├─ public/          Hero, CarCard, Catalog, formulaires…
│  ├─ admin/           Sidebar, StatCard, StatusBadge
│  └─ CarSilhouette, Reveal
├─ db/
│  ├─ schema.ts        modèle de données (Drizzle)
│  ├─ migrate.ts       application des migrations
│  └─ seed.ts          données de démo réalistes (12 véhicules)
├─ lib/
│  ├─ db.ts            client Drizzle + libSQL
│  ├─ session.ts       JWT httpOnly (jose)
│  ├─ rbac.ts          permissions par rôle
│  ├─ enums.ts         libellés FR des statuts
│  ├─ format.ts        formatage € / km / dates (fr-LU)
│  └─ actions/         server actions (auth, formulaires publics)
└─ middleware.ts       protection des routes /admin
```

## 🗄️ Base de données

Dev : **SQLite** via libSQL (aucune installation, fichier `dev.db`).
Prod : basculer `dialect`/`provider` sur **PostgreSQL** dans `drizzle.config.ts` + `src/lib/db.ts` (Drizzle supporte les deux). Le schéma est portable.

Entités : User, ActivityLog, Vehicle (+ Photo, Expense, Maintenance, Damage, StatusHistory), Customer (+ Document), Lead, Purchase, Sale, Reservation, Rental, CheckIn, CheckOut, Payment, Deposit, Contract, Notification.

---

## 🛣️ Suite (roadmap)

Modules prévus (V2, selon le plan d'architecture) : check-in/check-out mobile avec photos et signature, génération PDF des contrats et factures, maintenance & échéancier, dommages & sinistres, reporting financier avancé (ROI, TCO), notifications email/SMS, signature électronique.

Voir `plan-architecture.md` pour le plan complet.
