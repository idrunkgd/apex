// Génère des visuels "studio" et les associe aux véhicules (sauf la 718 Cayman GT4).
// Lancement : npm run seed:photos
import { createClient } from "@libsql/client";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { studioSVG, colorFor } from "./studio-gen.mjs";

const url = process.env.DATABASE_URL || "file:./dev.db";
const db = createClient({ url });

const EXCLURE = ["718 Cayman GT4"]; // modèles à ne pas toucher

const vehicles = (await db.execute("select id, marque, modele, couleur_ext from vehicles")).rows;
let done = 0, skipped = 0;

for (const v of vehicles) {
  const modele = String(v.modele);
  if (EXCLURE.some((e) => modele.includes(e))) {
    console.log("⏭  exclu :", v.marque, modele);
    skipped++;
    continue;
  }
  const real = Number((await db.execute({ sql: "select count(*) c from vehicle_photos where vehicle_id=? and url<>''", args: [v.id] })).rows[0].c);
  if (real > 0) {
    console.log("↷  garde les vraies photos :", v.marque, modele);
    skipped++;
    continue;
  }

  const accent = colorFor(v.couleur_ext || "");
  const dir = path.join("public", "uploads", String(v.id));
  fs.mkdirSync(dir, { recursive: true });
  await db.execute({ sql: "delete from vehicle_photos where vehicle_id=?", args: [v.id] });

  for (let i = 0; i < 3; i++) {
    const svg = studioSVG({ accent, variant: i });
    const jpg = await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toBuffer();
    const fname = `studio-${i}.jpg`;
    fs.writeFileSync(path.join(dir, fname), jpg);
    await db.execute({
      sql: "insert into vehicle_photos (id,vehicle_id,url,categorie,ordre,cover) values (?,?,?,?,?,?)",
      args: [randomUUID(), v.id, `/uploads/${v.id}/${fname}`, "EXTERIEUR", i, i === 0 ? 1 : 0],
    });
  }
  console.log("✓ ", v.marque, modele);
  done++;
}

console.log(`\n✓ Terminé : ${done} véhicules illustrés, ${skipped} ignorés.`);
db.close();
