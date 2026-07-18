import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="grain" />
      <PublicNav />
      <main className="relative z-[2]">{children}</main>
      <PublicFooter />
    </>
  );
}
