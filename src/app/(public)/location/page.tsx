import { Catalog } from "@/components/public/Catalog";

export const dynamic = "force-dynamic";

export default async function LocationPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  return (
    <Catalog
      mode="location"
      searchParams={sp}
      title="LOUER L'EXPÉRIENCE"
      subtitle="Notre flotte de supercars et véhicules de prestige disponibles à la location. À la journée, au week-end ou à la semaine."
    />
  );
}
