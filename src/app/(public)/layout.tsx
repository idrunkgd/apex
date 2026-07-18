import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { getSession } from "@/lib/session";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <>
      <div className="grain" />
      <PublicNav isAuthed={!!session} />
      <main className="relative z-[2]">{children}</main>
      <PublicFooter />
    </>
  );
}
