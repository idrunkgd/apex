// Libellés FR des valeurs "enum" (stockées en String pour compat SQLite)

export const ROLES = {
  ADMIN: "Administrateur",
  GESTIONNAIRE: "Gestionnaire",
  EMPLOYE: "Employé",
  COMPTABILITE: "Comptabilité",
} as const;
export type Role = keyof typeof ROLES;

export const ROLE_OPTIONS = Object.entries(ROLES).map(([value, label]) => ({ value, label }));

export const VEHICLE_STATUS = {
  EN_ACQUISITION: "En acquisition",
  EN_PREPARATION: "En préparation",
  DISPONIBLE: "Disponible",
  A_VENDRE: "À vendre",
  A_LOUER: "À louer",
  RESERVE: "Réservé",
  LOUE: "Loué",
  VENDU: "Vendu",
  EN_MAINTENANCE: "En maintenance",
  INDISPONIBLE: "Indisponible",
} as const;
export type VehicleStatus = keyof typeof VEHICLE_STATUS;

export const STATUS_COLOR: Record<string, string> = {
  DISPONIBLE: "text-emerald-400 border-emerald-400/40",
  A_LOUER: "text-emerald-400 border-emerald-400/40",
  A_VENDRE: "text-sky-400 border-sky-400/40",
  RESERVE: "text-amber-400 border-amber-400/40",
  LOUE: "text-orange border-orange/40",
  EN_MAINTENANCE: "text-purple-400 border-purple-400/40",
  EN_PREPARATION: "text-purple-400 border-purple-400/40",
  EN_ACQUISITION: "text-gris border-edge",
  VENDU: "text-gris border-edge",
  INDISPONIBLE: "text-red-400 border-red-400/40",
};

export const RESERVATION_STATUS = {
  DEMANDE: "Demande",
  OPTION: "Option",
  CONFIRMEE: "Confirmée",
  PAYEE: "Payée",
  EN_PREPARATION: "En préparation",
  PRETE: "Prête",
  REMISE: "Véhicule remis",
  EN_COURS: "En cours",
  RETOUR_ATTENDU: "Retour attendu",
  TERMINEE: "Terminée",
  ANNULEE: "Annulée",
  LITIGE: "Litige",
} as const;

export const CARBURANT = {
  ESSENCE: "Essence",
  DIESEL: "Diesel",
  ELECTRIQUE: "Électrique",
  HYBRIDE: "Hybride",
} as const;

export const CARROSSERIE = {
  COUPE: "Coupé",
  BERLINE: "Berline",
  SUV: "SUV",
  CABRIOLET: "Cabriolet",
  BREAK: "Break",
} as const;

export const TRANSMISSION = {
  PROPULSION: "Propulsion",
  TRACTION: "Traction",
  INTEGRALE: "Intégrale",
} as const;

export function label(map: Record<string, string>, key?: string | null): string {
  if (!key) return "—";
  return map[key] ?? key;
}
