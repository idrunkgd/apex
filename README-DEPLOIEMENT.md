# Déployer APEX en production (Railway — disque persistant)

Ce guide met le site en ligne sur **Railway**, un hébergeur simple qui garde ta base de
données SQLite et tes photos sur un **disque persistant** (donc rien ne se perd à chaque
mise à jour). Le projet est déjà prêt : Docker, migrations automatiques et création du
compte admin sont inclus.

> Alternatives équivalentes : **Render** (« Web Service » + « Disk ») ou **Fly.io**
> (`fly launch` + volume). La logique est la même : un conteneur Docker + un volume monté sur `/data`.

---

## Prérequis

- Un compte **GitHub** (gratuit) — pour héberger le code.
- Un compte **Railway** (railway.app). Le disque persistant nécessite le plan **Hobby (~5 $/mois)**.
- Coût total : quelques euros par mois. (Anthropic/moi ne pouvons pas créer ces comptes ni payer à ta place.)

---

## Étape 1 — Envoyer le code sur GitHub

Le plus simple sans ligne de commande : **GitHub Desktop** (desktop.github.com).
1. Installe GitHub Desktop, connecte ton compte.
2. « Add » → « Add Existing Repository » → choisis le dossier
   `/Users/gerald/Documents/Claude/Projects/Apex`.
3. « Publish repository » → décoche « Keep this code private » si tu veux, publie.

En ligne de commande (Terminal), équivalent :

```bash
cd ~/Documents/Claude/Projects/Apex
git init
git add .
git commit -m "APEX — version initiale"
# crée un repo vide sur github.com puis :
git remote add origin https://github.com/TON-COMPTE/apex.git
git branch -M main
git push -u origin main
```

> Les fichiers sensibles/lourds (`.env`, `node_modules`, `dev.db`, photos locales) sont déjà
> exclus par `.gitignore` — c'est normal qu'ils ne partent pas.

---

## Étape 2 — Créer le projet sur Railway

1. railway.app → **New Project** → **Deploy from GitHub repo** → autorise et choisis `apex`.
2. Railway détecte le **Dockerfile** et lance un premier build (il échouera tant que le
   volume et les variables ne sont pas mis — c'est normal, on les ajoute maintenant).

## Étape 3 — Ajouter le disque persistant (volume)

1. Ouvre le service → onglet **Variables** puis **Volumes** (selon l'UI : « + New Volume »).
2. **Mount path** : `/data`
3. Valide. C'est là que vivront la base (`/data/apex.db`) et les photos (`/data/uploads`).

## Étape 4 — Variables d'environnement

Dans le service → **Variables**, ajoute :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | `file:/data/apex.db` |
| `AUTH_SECRET` | une longue chaîne aléatoire (voir ci-dessous) |
| `ADMIN_EMAIL` | ton email de connexion |
| `ADMIN_PASSWORD` | un mot de passe fort |
| `ADMIN_NOM` | ton nom (optionnel) |
| `UPLOADS_DIR` | `/data/uploads` |

Pour générer un `AUTH_SECRET`, dans ton Terminal :

```bash
openssl rand -hex 32
```

Copie le résultat comme valeur de `AUTH_SECRET`.

> Ne mets PAS `PORT` : Railway l'injecte automatiquement, l'app l'utilise déjà.

## Étape 5 — Déployer

Railway relance le build automatiquement (ou clique **Deploy**). Au démarrage, le conteneur :
applique les migrations, crée ton compte admin, puis démarre le serveur.
Quand c'est vert, ouvre **Settings → Networking → Generate Domain** pour obtenir l'URL
publique (`xxxxx.up.railway.app`).

## Étape 6 — Première connexion

1. Va sur `https://ton-url.up.railway.app/login`
2. Connecte-toi avec `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
3. Ajoute tes véhicules, photos, tarifs, la bannière d'accueil… tout est prêt.

La base démarre **vide** (pas de données de démo) — c'est ce qu'on veut pour une vraie
production. Les photos que tu uploades vont sur le volume et **persistent** entre les mises à jour.

---

## Domaine personnalisé (ton propre nom de domaine)

Service → **Settings → Networking → Custom Domain** → saisis `www.tondomaine.com`,
puis chez ton registrar (OVH, Gandi…) crée l'enregistrement **CNAME** indiqué par Railway.
Le HTTPS est automatique.

## Mettre à jour le site plus tard

À chaque `git push` (ou publication via GitHub Desktop), Railway **redéploie tout seul**.
La base et les photos restent intactes (elles sont sur le volume).

## Sauvegardes (important en production)

Ta base est un seul fichier : `/data/apex.db`. Pense à le sauvegarder régulièrement
(Railway propose des sauvegardes de volume, ou télécharge le fichier périodiquement).
Les photos sont dans `/data/uploads`.

---

## Checklist « vraie production »

- ✅ **HTTPS** : automatique (Railway).
- ✅ **Secret de session** fort : via `AUTH_SECRET`.
- ✅ **Compte admin** réel : via `ADMIN_EMAIL` / `ADMIN_PASSWORD` (les comptes de démo
  `apex1234` n'existent pas en prod puisqu'on ne seede pas la démo).
- ⚠️ **Mentions légales / CGV / CGL / RGPD** : les pages sont des gabarits — fais rédiger/valider
  les vrais textes par un juriste avant d'ouvrir au public.
- ⚠️ **Emails & SMS** (confirmations de réservation, rappels) : l'architecture est prévue mais
  l'envoi réel n'est pas encore branché — à ajouter si tu veux les notifications automatiques.
- ⚠️ **Documents clients** (permis, CNI) : stockés sur le volume ; pour une conformité RGPD
  renforcée, prévois chiffrement au repos et durées de conservation.
- 💡 **Sauvegardes** : mets en place une sauvegarde régulière du volume.

Besoin d'aide sur l'une de ces étapes ? Dis-moi où tu bloques et je te débloque.
