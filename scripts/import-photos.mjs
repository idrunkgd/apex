// Importe TES vraies photos vers les bons véhicules.
//
// 1er lancement : crée un dossier par voiture dans "imports/".
// Ensuite : dépose tes photos (jpg, png, webp, heic…) dans le dossier de chaque voiture.
// 2e lancement : les photos sont converties et associées au véhicule (la 1re = couverture),
//                en remplaçant l'illustration studio.
//
// Lancement : npm run import:photos
import { createClient } from "@libsql/client";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const url = process.env.DATABASE_URL || "file:./dev.db";
const db = createClient({ url });
const IMPORT_DIR = "imports";
const IMG = /\.(jpe?g|png|webp|avif|heic|heif|tiff?)$/i;

function safe(s) { return String(s).replace(/[\/\\:*?"<>|]/g, "").trim(); }

const vehicles = (await db.execute("select id, ref_interne, marque, modele from vehicles")).rows;
fs.mkdirSync(IMPORT_DIR, { recursive: true });

// 1) s'assurer qu'un dossier existe pour chaque voiture
const existing = fs.readdirSync(IMPORT_DIR, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
for (const v of vehicles) {
  const has = existing.some((name) => new RegExp(v.ref_interne, "i").test(name));
  if (!has) {
    const folder = safe(`${v.ref_interne} - ${v.marque} ${v.modele}`);
    const p = path.join(IMPORT_DIR, folder);
    fs.mkdirSync(p, { recursive: true });
    fs.writeFileSync(path.join(p, "_déposez-les-photos-ici.txt"), "Placez ici les photos de cette voiture (jpg, png, webp, heic…).\nLa 1re dans l'ordre alphabétique deviendra la photo de couverture.\nPuis relancez : npm run import:photos\n");
  }
}

// 2) importer les photos présentes
const dirs = fs.readdirSync(IMPORT_DIR, { withFileTypes: true }).filter((d) => d.isDirectory());
let imported = 0;
const empty = [];

for (const d of dirs) {
  const refMatch = d.name.match(/APX-\d+/i);
  const v = refMatch && vehicles.find((x) => x.ref_interne.toLowerCase() === refMatch[0].toLowerCase());
  if (!v) { console.log("⚠  dossier non reconnu (aucun code APX-xxxx) :", d.name); continue; }

  const dir = path.join(IMPORT_DIR, d.name);
  const files = fs.readdirSync(dir).filter((f) => IMG.test(f)).sort();
  if (files.length === 0) { empty.push(`${v.marque} ${v.modele}`); continue; }

  const dest = path.join("public", "uploads", String(v.id));
  fs.mkdirSync(dest, { recursive: true });
  await db.execute({ sql: "delete from vehicle_photos where vehicle_id=?", args: [v.id] });

  let i = 0;
  for (const f of files) {
    try {
      const jpg = await sharp(path.join(dir, f)).rotate().resize({ width: 2200, withoutEnlargement: true }).jpeg({ quality: 84 }).toBuffer();
      const fname = `photo-${i}.jpg`;
      fs.writeFileSync(path.join(dest, fname), jpg);
      await db.execute({
        sql: "insert into vehicle_photos (id,vehicle_id,url,categorie,ordre,cover) values (?,?,?,?,?,?)",
        args: [randomUUID(), v.id, `/uploads/${v.id}/${fname}`, "EXTERIEUR", i, i === 0 ? 1 : 0],
      });
      i++;
    } catch (e) {
      console.log(`   ✗ ${f} ignorée (${e.message})`);
    }
  }
  console.log(`✓  ${v.marque} ${v.modele} — ${i} photo(s) importée(s)`);
  imported++;
}

console.log(`\n✓ Import terminé : ${imported} voiture(s) mise(s) à jour.`);
if (empty.length) {
  console.log(`\nDossiers encore vides (dépose des photos puis relance) :`);
  empty.forEach((e) => console.log("   ·", e));
}
console.log(`\nLes dossiers sont dans :  ${path.resolve(IMPORT_DIR)}`);
db.close();
