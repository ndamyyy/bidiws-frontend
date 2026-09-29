// ============================================================
// BIDIWS — API Adresse (gouvernement français)
// Fichier : src/api/adresse.api.ts
// https://api-adresse.data.gouv.fr/search/ — publique, gratuite, sans
// clé. fetch() natif plutôt que le client axios partagé (api/axios.ts) :
// ce dernier attache le token JWT BIDIWS via un intercepteur — un hôte
// externe ne doit jamais le recevoir.
// ============================================================

import type { AdresseSuggestion } from "../types";

const BASE_URL = "https://api-adresse.data.gouv.fr/search/";

interface FeatureAdresse {
  properties: {
    label: string;
    name?: string;
    postcode?: string;
    city?: string;
    type?: string;
  };
  geometry: {
    // GeoJSON : [longitude, latitude], dans cet ordre.
    coordinates: [number, number];
  };
}

interface ReponseAdresse {
  features: FeatureAdresse[];
}

// AbortSignal en paramètre : laisse l'appelant annuler une requête
// devenue obsolète (nouvelle frappe avant que la précédente ne réponde)
// plutôt que d'ignorer une réponse tardive après coup.
export const rechercherAdresses = async (
  query: string,
  signal?: AbortSignal
): Promise<AdresseSuggestion[]> => {
  const url = `${BASE_URL}?q=${encodeURIComponent(query)}&limit=5`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`API Adresse : réponse ${response.status}`);
  }

  const data: ReponseAdresse = await response.json();

  // "type": "housenumber" (adresse précise, avec numéro) uniquement —
  // une suggestion de rue seule n'a pas de coordonnées assez précises
  // pour la déduplication GPS (RattachementResidenceService, rayon 15m).
  return data.features
    .filter((f) => f.properties.type === "housenumber" && f.properties.postcode && f.properties.city)
    .map((f) => ({
      label     : f.properties.label,
      adresse   : f.properties.name ?? f.properties.label,
      codePostal: f.properties.postcode as string,
      ville     : f.properties.city as string,
      longitude : f.geometry.coordinates[0],
      latitude  : f.geometry.coordinates[1],
    }));
};
