// ============================================================
// BIDIWS — File d'attente hors-ligne
// Fichier : src/utils/offlineQueue.ts
// Scope volontairement limité à 3 actions (validerArret,
// signalerIncident, createSignalement) — pas un cache de lecture, pas
// une queue générique pour tout appel réseau. Persistée en
// localStorage : si l'appel échoue pour une cause RÉSEAU (pas
// d'erreur métier), l'action est mise en file plutôt que perdue, puis
// rejouée dans l'ordre par OfflineQueueContext au retour en ligne.
// ============================================================

import axios from "axios";
import { validerArret, signalerIncident, type IncidentRequest } from "../api/arrets.api";
import { createSignalement } from "../api/signalements.api";
import type { Arret, Signalement, StatutArret, SignalementRequest } from "../types";

const STORAGE_KEY = "bidiws_offline_queue";

export type OfflineQueueItem =
  | { id: string; createdAt: string; type: "validerArret"; args: { arretId: number; statut: StatutArret } }
  | { id: string; createdAt: string; type: "signalerIncident"; args: { arretId: number; data: IncidentRequest } }
  | { id: string; createdAt: string; type: "createSignalement"; args: { data: SignalementRequest } };

/** Levée par les wrappers *Offline ci-dessous quand l'appel a échoué
 * pour une cause réseau et a été mis en file — permet à l'appelant de
 * distinguer ce cas d'un vrai échec pour afficher un message adapté
 * ("sera renvoyé automatiquement") plutôt qu'une erreur générique. */
export class OfflineQueuedError extends Error {
  constructor() {
    super("Action mise en file d'attente hors-ligne");
    this.name = "OfflineQueuedError";
  }
}

/** Erreur réseau (aucune réponse du serveur — timeout, DNS, connexion
 * coupée) à distinguer d'une vraie erreur métier (réponse 4xx/5xx) :
 * seule la première doit être mise en file, la seconde a réellement
 * échoué et ne doit pas être rejouée telle quelle. */
export function isNetworkError(e: unknown): boolean {
  return axios.isAxiosError(e) && !e.response;
}

// ─────────────────────────────────────────
// PERSISTANCE
// ─────────────────────────────────────────

export function readQueue(): OfflineQueueItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(items: OfflineQueueItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    // Quota dépassé ou stockage indisponible — l'action reste perdue
    // pour le rejeu automatique, mais ne doit pas casser l'app.
    console.error("BIDIWS — Erreur écriture file hors-ligne", e);
  }
}

function pushItem(item: OfflineQueueItem): void {
  const queue = readQueue();
  queue.push(item);
  writeQueue(queue);
  notifyListeners();
}

function removeItem(id: string): void {
  writeQueue(readQueue().filter((i) => i.id !== id));
  notifyListeners();
}

// ─────────────────────────────────────────
// ABONNEMENT — permet à OfflineQueueContext de refléter la file en
// état React sans dupliquer la logique de lecture/écriture ici.
// ─────────────────────────────────────────

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeQueueChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notifyListeners(): void {
  listeners.forEach((fn) => fn());
}

// ─────────────────────────────────────────
// WRAPPERS — appel réel, mise en file uniquement sur erreur réseau
// ─────────────────────────────────────────

export async function validerArretOffline(arretId: number, statut: StatutArret): Promise<Arret> {
  try {
    return await validerArret(arretId, statut);
  } catch (e) {
    if (!isNetworkError(e)) throw e;
    pushItem({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), type: "validerArret", args: { arretId, statut } });
    throw new OfflineQueuedError();
  }
}

export async function signalerIncidentOffline(arretId: number, data: IncidentRequest): Promise<Arret> {
  try {
    return await signalerIncident(arretId, data);
  } catch (e) {
    if (!isNetworkError(e)) throw e;
    pushItem({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), type: "signalerIncident", args: { arretId, data } });
    throw new OfflineQueuedError();
  }
}

export async function createSignalementOffline(data: SignalementRequest): Promise<Signalement> {
  try {
    return await createSignalement(data);
  } catch (e) {
    if (!isNetworkError(e)) throw e;
    pushItem({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), type: "createSignalement", args: { data } });
    throw new OfflineQueuedError();
  }
}

// ─────────────────────────────────────────
// REJEU
// ─────────────────────────────────────────

async function executeItem(item: OfflineQueueItem): Promise<void> {
  switch (item.type) {
    case "validerArret":
      await validerArret(item.args.arretId, item.args.statut);
      return;
    case "signalerIncident":
      await signalerIncident(item.args.arretId, item.args.data);
      return;
    case "createSignalement":
      await createSignalement(item.args.data);
      return;
  }
}

export interface ReplayResult {
  succeeded: number;
  failed: number;
  /** true si le rejeu s'est arrêté avant la fin (nouvelle coupure
   * réseau) — les items restants ne sont PAS retirés de la file. */
  stoppedEarly: boolean;
}

/** Rejoue la file dans l'ordre d'ajout. S'arrête à la première erreur
 * réseau (probablement de nouveau hors-ligne), sans retirer l'item en
 * cours ni les suivants — on ne veut pas rejouer dans le désordre à
 * la prochaine tentative. Une erreur métier (ex. arrêt déjà validé
 * entre-temps) retire l'item : l'action a réellement échoué côté
 * serveur, la garder en file la referait échouer indéfiniment. */
export async function replayQueue(): Promise<ReplayResult> {
  const queue = readQueue();
  let succeeded = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      await executeItem(item);
      removeItem(item.id);
      succeeded++;
    } catch (e) {
      if (isNetworkError(e)) {
        return { succeeded, failed, stoppedEarly: true };
      }
      console.error("BIDIWS — Échec définitif d'une action en file hors-ligne", item.type, e);
      removeItem(item.id);
      failed++;
    }
  }

  return { succeeded, failed, stoppedEarly: false };
}
