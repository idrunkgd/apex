// Coordonnées de la société (paramétrables — à terme dans les Réglages).
export const COMPANY = {
  nom: "APEX",
  baseline: "Véhicules d'exception",
  adresse: "1 Boulevard Royal",
  ville: "L-2449 Luxembourg",
  pays: "Luxembourg",
  tel: "+352 27 00 00 00",
  email: "contact@apex.lu",
  tva: "LU12345678",
  tvaTaux: 0.17, // 17 % Luxembourg
  iban: "LU28 0019 4006 4475 0000",
  rcs: "RCS Luxembourg B123456",
};

export function htFromTtc(ttc: number, taux = COMPANY.tvaTaux) {
  return ttc / (1 + taux);
}
export function tvaFromTtc(ttc: number, taux = COMPANY.tvaTaux) {
  return ttc - htFromTtc(ttc, taux);
}
