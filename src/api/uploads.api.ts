// ============================================================
// BIDIWS — API Uploads
// Fichier : src/api/uploads.api.ts
// Utilitaire générique d'upload d'image — POST /uploads (backend,
// multipart/form-data), accessible à tout utilisateur authentifié.
// Renvoie une URL absolue (http://host/bidiws/files/xxx), directement
// utilisable dans un <img src>, servie en statique sans authentification
// (SecurityConfig, PUBLIC_ROUTES : "/files/**").
// ============================================================

import apiClient from "./axios";

export const uploadPhoto = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<{ url: string }>("/uploads", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.url;
};
