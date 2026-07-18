#!/bin/sh
set -e

# Répertoire des uploads sur le disque persistant (photos véhicules, bannière…)
: "${UPLOADS_DIR:=/data/uploads}"
mkdir -p "$UPLOADS_DIR"
rm -rf public/uploads
ln -sfn "$UPLOADS_DIR" public/uploads

echo "→ Migrations…"
node scripts/migrate.mjs

echo "→ Vérification du compte admin…"
node scripts/create-admin.mjs

echo "→ Démarrage du serveur…"
exec node server.js
