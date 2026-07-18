import { redirect } from "next/navigation";

// La gestion des réservations est désormais fusionnée dans la page Locations
// (cycle complet demande → confirmée → en cours → terminée).
export default function ReservationsRedirect() {
  redirect("/admin/locations");
}
