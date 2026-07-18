import { Catalog } from "@/components/public/Catalog";

export const dynamic = "force-dynamic";

export default async function VentePage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  return (
    <Catalog
      mode="vente"
      searchParams={sp}
      title="À VENDRE"
      subtitle="Une sélection rare de véhicules premium, sportifs et de collection. Historique vérifié, préparation d'exception."
    />
  );
}
