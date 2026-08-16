// ============================================================
// BIDIWS — Types TypeScript
// Fichier : src/types/index.ts
// Miroir exact du schéma de base de données
// ============================================================

// ─────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────

export type Role =
  | "HABITANT"
  | "GARDIEN"
  | "CHAUFFEUR"
  | "SYNDIC"
  | "MAIRIE"
  | "BAILLEUR"
  | "ADMIN";

export type StatutTournee =
  | "PLANIFIEE"
  | "EN_COURS"
  | "TERMINEE"
  | "ANNULEE";

export type StatutArret =
  | "EN_ATTENTE"
  | "EN_APPROCHE"
  | "COLLECTE_PROBABLE"
  | "COLLECTE_CONFIRMEE"
  | "INCIDENT";

export type ModeDetection =
  | "GPS_AUTO"
  | "VALIDATION_CHAUFFEUR"
  | "CAPTEUR_BENNE"
  | "RFID"
  | "COMMUNAUTAIRE";

export type TypeNotification =
  | "APPROCHE"
  | "COLLECTE_CONFIRMEE"
  | "COLLECTE_PROBABLE"
  | "NON_PASSAGE"
  | "RAPPEL_BAC"
  | "INCIDENT";

export type CanalNotification =
  | "PUSH"
  | "SMS"
  | "EMAIL";

export type TypeSignalement =
  | "BAC_PLEIN"
  | "DEPOT_SAUVAGE"
  | "BAC_ENDOMMAGE"
  | "BAC_NON_RENTRE"
  | "AUTRE";

export type StatutSignalement =
  | "OUVERT"
  | "EN_TRAITEMENT"
  | "RESOLU"
  | "CLOS";

export type SourceGps =
  | "APP"
  | "BOITIER_GPS"
  | "SIMULE";

export type Plateforme =
  | "IOS"
  | "ANDROID"
  | "WEB";

// ─────────────────────────────────────────
// ENTITÉS PRINCIPALES
// ─────────────────────────────────────────

export interface Utilisateur {
  id          : number;
  nom         : string;
  prenom      : string;
  email       : string;
  telephone  ?: string;
  role        : Role;
  actif       : boolean;
  createdAt   : string;
  updatedAt   : string;
}

export interface Ville {
  id          : number;
  nom         : string;
  codePostal  : string;
  departement?: string;
  actif       : boolean;
}

export interface Zone {
  id          : number;
  villeId     : number;
  nom         : string;
  code        : string;
  description?: string;
}

export interface Residence {
  id              : number;
  nom             : string;
  adresse         : string;
  complement     ?: string;
  codePostal      : string;
  ville           : Ville;
  zone           ?: Zone;
  latitude       ?: number;
  longitude      ?: number;
  rayonDetection  : number;
  nbConteneurs    : number;
  actif           : boolean;
  createdAt       : string;
  gardiens        : Utilisateur[];
}

export interface TypeCollecte {
  id      : number;
  code    : string;
  libelle : string;
  couleur?: string;
  icone  ?: string;
}

export interface CalendrierCollecte {
  id              : number;
  residenceId     : number;
  typeCollecte    : TypeCollecte;
  jourSemaine     : number;       // 1=Lundi ... 7=Dimanche
  heureEstimee   ?: string;       // "HH:mm"
  actif           : boolean;
}

export interface Camion {
  id              : number;
  immatriculation : string;
  modele         ?: string;
  typeBenne      ?: string;
  capaciteTonnes ?: number;
  gpsActif        : boolean;
  capteurBenne    : boolean;
  actif           : boolean;
}

// Forme plate confirmée contre le vrai TourneeResponseDto (testé en
// Postman) — le backend dénormalise typeCollecte/camion/chauffeur/zone
// au lieu de les imbriquer. `createdAt` n'a pas pu être confirmé
// (absent de l'échantillon vérifié, tentative de retest en session
// bloquée par des 500 backend sur /tournees) — laissé optionnel par
// prudence plutôt que deviné. `arrets` conservé tel quel : absent de
// l'échantillon DTO mais toujours utilisé comme état imbriqué mutable
// par ChauffeurTourneePage/TourneesPage (mocks) — sortir ce champ du
// type est un changement plus large que le simple aplatissement demandé
// ici, à traiter quand ces pages seront débranchées des mocks.
export interface Tournee {
  id                    : number;
  dateTournee           : string;       // "YYYY-MM-DD"
  typeCollecteId        : number;
  typeCollecteLibelle   : string;
  camionId              : number;
  camionImmatriculation : string;
  chauffeurId           : number;
  chauffeurNom          : string;
  chauffeurPrenom       : string;
  zoneId               ?: number;
  zoneNom              ?: string;
  statut                : StatutTournee;
  heureDebut           ?: string;
  heureFin             ?: string;
  createdAt            ?: string;
  arrets                 : Arret[];
}

export interface Arret {
  id                   : number;
  tourneeId            : number;
  residence            : Residence;
  ordre                : number;
  statut               : StatutArret;
  heureEstimee        ?: string;
  heureApproche       ?: string;
  heureCollecte       ?: string;
  scoreConfiance       : number;   // 0 à 100
  modeDetection       ?: ModeDetection;
  nbConteneurs         : number;
  typesConteneurs     ?: string;
  poidsKg             ?: number;
  incident             : boolean;
  descriptionIncident ?: string;
  photoIncidentUrl    ?: string;
  createdAt            : string;
  updatedAt            : string;
}

// Détail d'un bac/conteneur rattaché à un arrêt — forme exacte du
// backend ArretConteneurResponseDto (vérifiée en conditions réelles,
// session du 16/08/2026)
export interface ArretConteneur {
  id                     : number;
  conteneurId            : number;
  conteneurCode          : string;
  statut                 : 'EN_ATTENTE' | 'EN_APPROCHE' | 'COLLECTE_PROBABLE' | 'COLLECTE_CONFIRMEE' | 'INCIDENT';
  modeDetection          : 'VALIDATION_CHAUFFEUR' | 'CAPTEUR_BENNE' | 'RFID' | 'GPS_AUTO' | null;
  scoreConfiance         : number | null;
  horodatageConfirmation : string | null;
  niveauRemplissagePct   : number | null;
}

export interface SignalGps {
  id          : number;
  tourneeId   : number;
  latitude    : number;
  longitude   : number;
  vitesseKmh ?: number;
  cap        ?: number;
  precisionM ?: number;
  horodatage  : string;
  source      : SourceGps;
}

export interface Notification {
  id              : number;
  destinataireId  : number;
  arretId        ?: number;
  residenceId    ?: number;
  type            : TypeNotification;
  titre           : string;
  message         : string;
  canal           : CanalNotification;
  lu              : boolean;
  envoye          : boolean;
  heureEnvoi     ?: string;
  heureLecture   ?: string;
  createdAt       : string;
}

export interface Signalement {
  id           : number;
  auteur       : Utilisateur;
  residence   ?: Residence;
  arretId     ?: number;
  type         : TypeSignalement;
  description ?: string;
  photoUrl    ?: string;
  latitude    ?: number;
  longitude   ?: number;
  statut       : StatutSignalement;
  createdAt    : string;
  resoluAt    ?: string;
}

// ─────────────────────────────────────────
// DTOs — REQUÊTES (ce qu'on envoie au back)
// ─────────────────────────────────────────

export interface LoginRequest {
  email      : string;
  motDePasse : string;
}

export interface RegisterRequest {
  nom        : string;
  prenom     : string;
  email      : string;
  motDePasse : string;
  telephone ?: string;
  role       : Role;
}

export interface TourneeRequest {
  dateTournee     : string;
  typeCollecteId  : number;
  camionId        : number;
  chauffeurId     : number;
  zoneId         ?: number;
}

export interface ArretValiderRequest {
  modeDetection   : ModeDetection;
  typesConteneurs?: string;
  nbConteneurs   ?: number;
  poidsKg        ?: number;
}

export interface SignalGpsRequest {
  tourneeId   : number;
  latitude    : number;
  longitude   : number;
  vitesseKmh ?: number;
  cap        ?: number;
  precisionM ?: number;
  horodatage  : string;
  source      : SourceGps;
}

export interface SignalementRequest {
  residenceId ?: number;
  arretId     ?: number;
  type         : TypeSignalement;
  description ?: string;
  photoUrl    ?: string;
  latitude    ?: number;
  longitude   ?: number;
}

// ─────────────────────────────────────────
// DTOs — RÉPONSES (ce qu'on reçoit du back)
// ─────────────────────────────────────────

export interface AuthResponse {
  token : string;
}

export interface PageResponse<T> {
  content       : T[];
  totalElements : number;
  totalPages    : number;
  size          : number;
  number        : number;
  first         : boolean;
  last          : boolean;
}

export interface ApiError {
  status    : number;
  message   : string;
  timestamp : string;
  path      : string;
}


// ─────────────────────────────────────────
// TYPES UTILITAIRES FRONTEND
// ─────────────────────────────────────────

// Utilisateur connecté stocké dans le contexte Auth
export interface AuthUser {
  token       : string;
  utilisateur : Utilisateur;
}

// État d'une requête API
export type ApiStatus = "idle" | "loading" | "success" | "error";

// Statistiques dashboard syndic
export interface DashboardStats {
  totalResidences     : number;
  tourneesEnCours     : number;
  collectesConfirmees : number;
  collectesProbables  : number;
  enAttente           : number;
  incidents           : number;
  notificationsNonLues: number;
}

// Position GPS temps réel du camion
export interface PositionCamion {
  tourneeId : number;
  latitude  : number;
  longitude : number;
  vitesse   : number;
  horodatage: string;
}