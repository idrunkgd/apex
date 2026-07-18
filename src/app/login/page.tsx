import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./LoginForm";
import { Wordmark } from "@/components/Wordmark";

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");
  return (
    <div className="min-h-screen flex items-center justify-center px-5 relative overflow-hidden">
      <div className="grain" />
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 w-[80vw] h-[50vh] bg-[radial-gradient(closest-side,rgba(255,90,0,.15),transparent_70%)] blur-2xl" />
      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="flex items-center gap-3 justify-center mb-2">
          <span className="w-2.5 h-2.5 bg-orange rounded-full shadow-glow" />
          <Wordmark size="lg" />
        </Link>
        <p className="text-center font-cond text-[11px] tracking-[3px] uppercase text-gris mb-8 mt-2">Cockpit · Espace professionnel</p>
        <div className="border border-edge rounded-lg bg-carbone/80 backdrop-blur p-8">
          <LoginForm />
        </div>
        <Link href="/" className="block text-center font-cond text-xs tracking-wide uppercase text-gris hover:text-orange mt-6 transition-colors">← Retour au site</Link>
      </div>
    </div>
  );
}
