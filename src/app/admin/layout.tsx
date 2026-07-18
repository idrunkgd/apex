import { requireUser } from "@/lib/rbac";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="flex min-h-screen bg-noir">
      <AdminSidebar user={{ nom: user.nom, role: user.role }} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
