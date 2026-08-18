// ============================================================
// BIDIWS — Données mockées
// Fichier : src/mocks/data.ts
// Miroir exact de la BDD — remplacé par les vrais appels API
// quand le backend sera prêt
// ============================================================

import type {
  Utilisateur,
  Ville,
  Zone,
  Residence,
  TypeCollecte,
  Camion,
  Tournee,
  Arret,
  Notification,
  Signalement,
  DashboardStats,
} from "../types";

// ─────────────────────────────────────────
// VILLES
// ─────────────────────────────────────────

export const MOCK_VILLES: Ville[] = [
  { id: 1, nom: "Étain",  codePostal: "55400", departement: "Meuse", actif: true },
  { id: 2, nom: "Verdun", codePostal: "55100", departement: "Meuse", actif: true },
];

// ─────────────────────────────────────────
// ZONES
// ─────────────────────────────────────────

export const MOCK_ZONES: Zone[] = [
  { id: 1, villeId: 1, nom: "Secteur A", code: "A", description: "Centre ville" },
  { id: 2, villeId: 1, nom: "Secteur B", code: "B", description: "Périphérie nord" },
  { id: 3, villeId: 2, nom: "Secteur A", code: "A", description: "Centre Verdun" },
];

// ─────────────────────────────────────────
// TYPES DE COLLECTE
// ─────────────────────────────────────────

export const MOCK_TYPES_COLLECTE: TypeCollecte[] = [
  { id: 1, code: "OM",          libelle: "Ordures ménagères", couleur: "#4CAF50", icone: "trash"   },
  { id: 2, code: "TRI",         libelle: "Tri sélectif",      couleur: "#2196F3", icone: "recycle" },
  { id: 3, code: "VERRE",       libelle: "Verre",             couleur: "#9C27B0", icone: "glass"   },
  { id: 4, code: "ENCOMBRANTS", libelle: "Encombrants",       couleur: "#FF9800", icone: "truck"   },
  { id: 5, code: "BIODECHETS",  libelle: "Biodéchets",        couleur: "#795548", icone: "leaf"    },
];

// ─────────────────────────────────────────
// UTILISATEURS
// ─────────────────────────────────────────

export const MOCK_UTILISATEURS: Utilisateur[] = [
  {
    id: 1, nom: "Admin",   prenom: "BIDIWS",
    email: "admin@bidiws.com", telephone: "06 00 00 00 00",
    role: 'ADMIN', actif: true,
    createdAt: "2026-01-01T00:00:00", updatedAt: "2026-01-01T00:00:00",
  },
  {
    id: 2, nom: "Dupont",  prenom: "Marcel",
    email: "gardien1@bidiws.com", telephone: "06 12 34 56 78",
    role: 'GARDIEN', actif: true,
    createdAt: "2026-01-15T00:00:00", updatedAt: "2026-01-15T00:00:00",
  },
  {
    id: 4, nom: "Ba",      prenom: "Karim",
    email: "chauffeur1@bidiws.com", telephone: "06 55 44 33 22",
    role: 'CHAUFFEUR', actif: true,
    createdAt: "2026-02-01T00:00:00", updatedAt: "2026-02-01T00:00:00",
  },
  {
    id: 5, nom: "Martin",  prenom: "Claire",
    email: "syndic@bidiws.com", telephone: "06 11 22 33 44",
    role: 'SYNDIC', actif: true,
    createdAt: "2026-01-10T00:00:00", updatedAt: "2026-01-10T00:00:00",
  },
  {
    id: 6, nom: "Chen",    prenom: "Li",
    email: "gardien3@bidiws.com", telephone: "06 33 44 55 66",
    role: 'GARDIEN', actif: true,
    createdAt: "2026-01-20T00:00:00", updatedAt: "2026-01-20T00:00:00",
  },
  {
    id: 7, nom: "Sissoko", prenom: "Amadou",
    email: "gardien4@bidiws.com", telephone: "06 44 55 66 77",
    role: 'GARDIEN', actif: true,
    createdAt: "2026-01-20T00:00:00", updatedAt: "2026-01-20T00:00:00",
  },
  {
    id: 8, nom: "Habitant", prenom: "Jean",
    email: "habitant@bidiws.com", telephone: "06 55 66 77 88",
    role: 'HABITANT', actif: true,
    createdAt: "2026-02-10T00:00:00", updatedAt: "2026-02-10T00:00:00",
  },
];

// ─────────────────────────────────────────
// CAMIONS
// ─────────────────────────────────────────

export const MOCK_CAMIONS: Camion[] = [
  {
    id: 1, immatriculation: "TK-4521",
    modele: "Mercedes Econic", typeBenne: "Benne à ordures",
    capaciteTonnes: 12, gpsActif: true, capteurBenne: false, actif: true,
  },
  {
    id: 2, immatriculation: "TK-3380",
    modele: "Renault D Wide", typeBenne: "Benne à ordures",
    capaciteTonnes: 10, gpsActif: true, capteurBenne: true, actif: true,
  },
  {
    id: 3, immatriculation: "TK-2210",
    modele: "Volvo FE", typeBenne: "Ampliroll",
    capaciteTonnes: 15, gpsActif: false, capteurBenne: false, actif: true,
  },
];

// ─────────────────────────────────────────
// RÉSIDENCES
// ─────────────────────────────────────────

export const MOCK_RESIDENCES: Residence[] = [
  {
    id: 1, nom: "Résidence Les Érables",
    adresse: "12 rue Pasteur", codePostal: "55400",
    villeId: MOCK_VILLES[0].id, villeNom: MOCK_VILLES[0].nom,
    zoneId: MOCK_ZONES[0].id, zoneNom: MOCK_ZONES[0].nom,
    latitude: 49.2101, longitude: 5.6349,
    rayonDetection: 50, nbConteneurs: 3, actif: true,
  },
  {
    id: 2, nom: "Résidence du Parc",
    adresse: "4 allée des Tilleuls", codePostal: "55400",
    villeId: MOCK_VILLES[0].id, villeNom: MOCK_VILLES[0].nom,
    zoneId: MOCK_ZONES[0].id, zoneNom: MOCK_ZONES[0].nom,
    latitude: 49.2115, longitude: 5.6372,
    rayonDetection: 40, nbConteneurs: 4, actif: true,
  },
  {
    id: 3, nom: "Résidence Voltaire",
    adresse: "27 rue Voltaire", codePostal: "55400",
    villeId: MOCK_VILLES[0].id, villeNom: MOCK_VILLES[0].nom,
    zoneId: MOCK_ZONES[1].id, zoneNom: MOCK_ZONES[1].nom,
    latitude: 49.2089, longitude: 5.6401,
    rayonDetection: 50, nbConteneurs: 2, actif: true,
  },
  {
    id: 4, nom: "Les Jardins de Verdun",
    adresse: "8 bd de la Paix", codePostal: "55100",
    villeId: MOCK_VILLES[1].id, villeNom: MOCK_VILLES[1].nom,
    zoneId: MOCK_ZONES[2].id, zoneNom: MOCK_ZONES[2].nom,
    latitude: 49.1620, longitude: 5.3880,
    rayonDetection: 60, nbConteneurs: 5, actif: true,
  },
  {
    id: 5, nom: "Résidence Bellevue",
    adresse: "3 rue du Moulin", codePostal: "55400",
    villeId: MOCK_VILLES[0].id, villeNom: MOCK_VILLES[0].nom,
    zoneId: MOCK_ZONES[0].id, zoneNom: MOCK_ZONES[0].nom,
    latitude: 49.2130, longitude: 5.6310,
    rayonDetection: 45, nbConteneurs: 2, actif: true,
  },
];

// ─────────────────────────────────────────
// ARRÊTS
// ─────────────────────────────────────────

export const MOCK_ARRETS: Arret[] = [
  {
    id: 1, tourneeId: 1,
    residenceId: MOCK_RESIDENCES[0].id, residenceNom: MOCK_RESIDENCES[0].nom, residenceAdresse: MOCK_RESIDENCES[0].adresse,
    ordre: 1,
    statut: 'COLLECTE_CONFIRMEE',
    heureEstimee:  "2026-06-22T09:30:00",
    heureApproche: "2026-06-22T09:38:00",
    heureCollecte: "2026-06-22T09:45:00",
    scoreConfiance: 95, modeDetection: 'GPS_AUTO',
    nbConteneurs: 3, typesConteneurs: "OM×3",
    poidsKg: 142, incident: false,
  },
  {
    id: 2, tourneeId: 1,
    residenceId: MOCK_RESIDENCES[1].id, residenceNom: MOCK_RESIDENCES[1].nom, residenceAdresse: MOCK_RESIDENCES[1].adresse,
    ordre: 2,
    statut: 'COLLECTE_CONFIRMEE',
    heureEstimee:  "2026-06-22T10:00:00",
    heureApproche: "2026-06-22T10:05:00",
    heureCollecte: "2026-06-22T10:12:00",
    scoreConfiance: 88, modeDetection: 'VALIDATION_CHAUFFEUR',
    nbConteneurs: 4, typesConteneurs: "OM×4",
    incident: false,
  },
  {
    id: 3, tourneeId: 1,
    residenceId: MOCK_RESIDENCES[4].id, residenceNom: MOCK_RESIDENCES[4].nom, residenceAdresse: MOCK_RESIDENCES[4].adresse,
    ordre: 3,
    statut: 'EN_APPROCHE',
    heureEstimee: "2026-06-22T10:30:00",
    scoreConfiance: 60, modeDetection: 'GPS_AUTO',
    nbConteneurs: 2, incident: false,
  },
  {
    id: 4, tourneeId: 2,
    residenceId: MOCK_RESIDENCES[2].id, residenceNom: MOCK_RESIDENCES[2].nom, residenceAdresse: MOCK_RESIDENCES[2].adresse,
    ordre: 1,
    statut: 'EN_ATTENTE',
    heureEstimee: "2026-06-22T14:00:00",
    scoreConfiance: 0,
    nbConteneurs: 2, incident: false,
  },
  {
    id: 5, tourneeId: 2,
    residenceId: MOCK_RESIDENCES[3].id, residenceNom: MOCK_RESIDENCES[3].nom, residenceAdresse: MOCK_RESIDENCES[3].adresse,
    ordre: 2,
    statut: 'EN_ATTENTE',
    heureEstimee: "2026-06-22T14:30:00",
    scoreConfiance: 0,
    nbConteneurs: 5, incident: false,
  },
];

// ─────────────────────────────────────────
// TOURNÉES
// ─────────────────────────────────────────

export const MOCK_TOURNEES: Tournee[] = [
  {
    id: 1,
    dateTournee:           "2026-06-22",
    typeCollecteId:        MOCK_TYPES_COLLECTE[0].id,
    typeCollecteLibelle:   MOCK_TYPES_COLLECTE[0].libelle,
    camionId:              MOCK_CAMIONS[0].id,
    camionImmatriculation: MOCK_CAMIONS[0].immatriculation,
    chauffeurId:           MOCK_UTILISATEURS[3].id,
    chauffeurNom:          MOCK_UTILISATEURS[3].nom,
    chauffeurPrenom:       MOCK_UTILISATEURS[3].prenom,
    zoneId:                MOCK_ZONES[0].id,
    zoneNom:               MOCK_ZONES[0].nom,
    statut:                'EN_COURS',
    heureDebut:            "2026-06-22T08:00:00",
    createdAt:             "2026-06-21T18:00:00",
    arrets:                [MOCK_ARRETS[0], MOCK_ARRETS[1], MOCK_ARRETS[2]],
  },
  {
    id: 2,
    dateTournee:           "2026-06-22",
    typeCollecteId:        MOCK_TYPES_COLLECTE[1].id,
    typeCollecteLibelle:   MOCK_TYPES_COLLECTE[1].libelle,
    camionId:              MOCK_CAMIONS[1].id,
    camionImmatriculation: MOCK_CAMIONS[1].immatriculation,
    chauffeurId:           MOCK_UTILISATEURS[4].id,
    chauffeurNom:          MOCK_UTILISATEURS[4].nom,
    chauffeurPrenom:       MOCK_UTILISATEURS[4].prenom,
    zoneId:                MOCK_ZONES[1].id,
    zoneNom:               MOCK_ZONES[1].nom,
    statut:                'PLANIFIEE',
    createdAt:             "2026-06-21T18:00:00",
    arrets:                [MOCK_ARRETS[3], MOCK_ARRETS[4]],
  },
];

// ─────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1, destinataireId: 2, arretId: 1, residenceId: 1,
    type:    'COLLECTE_CONFIRMEE',
    titre:   "Collecte effectuée",
    message: "La collecte a été effectuée au 12 rue Pasteur à 09h45. Vous pouvez rentrer les conteneurs.",
    canal:   'PUSH',
    lu: true, envoye: true,
    heureEnvoi:   "2026-06-22T09:45:00",
    heureLecture: "2026-06-22T09:50:00",
    createdAt:    "2026-06-22T09:45:00",
  },
  {
    id: 2, destinataireId: 3, arretId: 2, residenceId: 2,
    type:    'COLLECTE_CONFIRMEE',
    titre:   "Collecte effectuée",
    message: "La collecte a été effectuée au 4 allée des Tilleuls à 10h12. Vous pouvez rentrer les conteneurs.",
    canal:   'PUSH',
    lu: false, envoye: true,
    heureEnvoi: "2026-06-22T10:12:00",
    createdAt:  "2026-06-22T10:12:00",
  },
  {
    id: 3, destinataireId: 2, arretId: 3, residenceId: 5,
    type:    'APPROCHE',
    titre:   "Camion en approche",
    message: "Le camion TK-4521 est en approche de votre résidence. Passage estimé dans environ 8 minutes.",
    canal:   'PUSH',
    lu: false, envoye: true,
    heureEnvoi: "2026-06-22T10:22:00",
    createdAt:  "2026-06-22T10:22:00",
  },
  {
    id: 4, destinataireId: 6, arretId: 3, residenceId: 5,
    type:    'APPROCHE',
    titre:   "Camion en approche — Secteur A",
    message: "Le camion TK-4521 approche de la Résidence Bellevue (3 rue du Moulin). ETA : ~8 min.",
    canal:   'PUSH',
    lu: false, envoye: true,
    heureEnvoi: "2026-06-22T10:22:00",
    createdAt:  "2026-06-22T10:22:00",
  },
];

// ─────────────────────────────────────────
// SIGNALEMENTS
// ─────────────────────────────────────────

export const MOCK_SIGNALEMENTS: Signalement[] = [
  {
    id: 1,
    auteurId: MOCK_UTILISATEURS[1].id, auteurNom: MOCK_UTILISATEURS[1].nom, auteurPrenom: MOCK_UTILISATEURS[1].prenom,
    residenceId: MOCK_RESIDENCES[0].id, residenceNom: MOCK_RESIDENCES[0].nom, arretId: 1,
    type:        'BAC_PLEIN',
    description: "Le bac OM n°2 déborde, non vidé lors du dernier passage.",
    latitude: 49.2101, longitude: 5.6349,
    statut:    'EN_TRAITEMENT',
    createdAt: "2026-06-20T14:30:00",
  },
  {
    id: 2,
    auteurId: MOCK_UTILISATEURS[6].id, auteurNom: MOCK_UTILISATEURS[6].nom, auteurPrenom: MOCK_UTILISATEURS[6].prenom,
    residenceId: MOCK_RESIDENCES[2].id, residenceNom: MOCK_RESIDENCES[2].nom,
    type:        'DEPOT_SAUVAGE',
    description: "Dépôt sauvage de sacs noirs devant le portail.",
    latitude: 49.2089, longitude: 5.6401,
    statut:    'OUVERT',
    createdAt: "2026-06-22T08:15:00",
  },
];

// ─────────────────────────────────────────
// STATS DASHBOARD
// ─────────────────────────────────────────

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalResidences     : 5,
  tourneesEnCours     : 1,
  collectesConfirmees : 2,
  collectesProbables  : 1,
  enAttente           : 2,
  incidents           : 0,
  notificationsNonLues: 3,
};

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

// Récupérer les arrêts d'une tournée
export const getArretsByTourneeId = (tourneeId: number): Arret[] =>
  MOCK_ARRETS.filter((a) => a.tourneeId === tourneeId);

// Récupérer les notifications d'un utilisateur
export const getNotificationsByUserId = (userId: number): Notification[] =>
  MOCK_NOTIFICATIONS.filter((n) => n.destinataireId === userId);

// Récupérer une résidence par ID
export const getResidenceById = (id: number): Residence | undefined =>
  MOCK_RESIDENCES.find((r) => r.id === id);

// Progression d'une tournée en %
export const getTourneeProgress = (tournee: Tournee): number => {
  if (tournee.arrets.length === 0) return 0;
  const done = tournee.arrets.filter(
    (a) => a.statut === 'COLLECTE_CONFIRMEE'
  ).length;
  return Math.round((done / tournee.arrets.length) * 100);
};

// Compter les non lues
export const countNonLues = (notifications: Notification[]): number =>
  notifications.filter((n) => !n.lu).length;