// Étapes de la checklist de remise (check-in) et angles photo.

export const CHECKIN_ITEMS: { key: string; label: string }[] = [
  { key: "identite", label: "Identité vérifiée" },
  { key: "permis", label: "Permis vérifié" },
  { key: "contrat", label: "Contrat signé" },
  { key: "paiement", label: "Paiement reçu" },
  { key: "caution", label: "Caution bloquée" },
  { key: "carburant", label: "Niveau carburant relevé" },
  { key: "pneus", label: "État & pression des pneus" },
  { key: "proprete", label: "Propreté vérifiée" },
  { key: "documents", label: "Documents à bord" },
  { key: "accessoires", label: "Accessoires présents" },
  { key: "cles", label: "Jeux de clés remis" },
];

export const CHECKOUT_ITEMS: { key: string; label: string }[] = [
  { key: "carrosserie", label: "Carrosserie inspectée" },
  { key: "interieur", label: "Intérieur inspecté" },
  { key: "pneus", label: "Pneus & jantes vérifiés" },
  { key: "carburant", label: "Niveau carburant relevé" },
  { key: "accessoires", label: "Accessoires restitués" },
  { key: "cles", label: "Clés restituées" },
  { key: "documents", label: "Documents restitués" },
];

export const PHOTO_ANGLES: { key: string; label: string }[] = [
  { key: "avant", label: "Avant" },
  { key: "arriere", label: "Arrière" },
  { key: "gauche", label: "Côté gauche" },
  { key: "droite", label: "Côté droit" },
  { key: "interieur", label: "Intérieur" },
  { key: "jantes", label: "Jantes" },
  { key: "parebrise", label: "Pare-brise" },
];
