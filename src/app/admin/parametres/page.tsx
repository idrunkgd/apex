import Link from "next/link";
import { requirePermission } from "@/lib/rbac";
import { heroImageUrl } from "@/lib/site";
import { HeroUploader } from "@/components/admin/HeroUploader";

export const dynamic = "force-dynamic";

export default async function ParametresPage() {
  await requirePermission("vehicle", "write");
  const hero = heroImageUrl();

  return (
    <div className="p-5 md:p-8 max-w-[1400px]">
      <div className="mb-6 pl-12 lg:pl-0">
        <div className="font-cond text-[11px] tracking-[3px] uppercase text-orange">Administration</div>
        <h1 className="font-display text-5xl leading-none mt-1">PARAMÈTRES</h1>
      </div>

      <HeroUploader current={hero} />

      <p className="font-cond text-xs text-gris mt-6">
        Astuce : tu peux aussi mettre en avant un véhicule sur l'accueil en l'activant « en vedette » depuis sa fiche
        dans la flotte — sa photo de couverture apparaît alors dans la section « En vedette ».
        <Link href="/admin/flotte" className="text-orange hover:underline ml-1">Aller à la flotte →</Link>
      </p>
    </div>
  );
}
