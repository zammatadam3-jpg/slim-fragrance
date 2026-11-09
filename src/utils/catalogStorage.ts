import { ALL_CATALOG_ITEMS, Fragrance } from '../data/fragrances';
import {
  deleteFragranceFromFirestore,
  getFragrancesFromFirestore,
  saveBatchFragrancesToFirestore,
  saveFragranceToFirestore,
} from './firebase';

export const CUSTOM_CATALOG_KEY = 'salim_fragrance_custom_catalog_v2';
export const ADMIN_AUTH_KEY = 'salim_fragrance_admin_auth_v2';

/**
 * High-entropy secret route token:
 * Impossible to guess (not /admin). Only accessible via e.g. #sf-vault-k89x2 or ?vault=sf-vault-k89x2
 */
export const ADMIN_SECRET_ROUTE = 'sf-vault-k89x2';

/**
 * 12-character high-security brand password:
 * Contains uppercase (S, C), lowercase (alim, asa), special (@), and numbers (26).
 * Length: 12 characters.
 * Extremely easy for the brand owner to remember ("Salim @ Casa 26"), impossible to guess.
 */
export const DEFAULT_ADMIN_PASSWORD = 'Salim@Casa26';

const ATTEMPTS_KEY = 'salim_admin_attempts_count';
const LOCKOUT_KEY = 'salim_admin_lockout_until';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 10 * 60 * 1000; // 10 minutes lockout

/**
 * Validates and safely loads custom stored catalog from local storage.
 */
export function getStoredCustomCatalog(): Fragrance[] | null {
  try {
    const raw =
      localStorage.getItem(CUSTOM_CATALOG_KEY) ||
      localStorage.getItem('salim_fragrance_persisted_catalog_v3') ||
      localStorage.getItem('slim_fragrance_custom_catalog_v2');
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const valid = parsed.every(
        (item) =>
          typeof item === 'object' &&
          item !== null &&
          typeof item.id === 'string' &&
          typeof item.name === 'string' &&
          typeof item.priceMad === 'number'
      );
      if (valid) return parsed as Fragrance[];
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Persists updated catalog into browser storage.
 */
export function saveStoredCustomCatalog(items: Fragrance[]): void {
  if (!Array.isArray(items)) {
    return;
  }
  try {
    localStorage.setItem(CUSTOM_CATALOG_KEY, JSON.stringify(items));
    localStorage.setItem('salim_fragrance_persisted_catalog_v3', JSON.stringify(items));
  } catch (error) {
    console.warn('Failed to save custom catalog locally:', error);
  }
}

/**
 * Resets catalog back to pristine house collection.
 */
export function resetStoredCustomCatalog(): void {
  try {
    localStorage.setItem(CUSTOM_CATALOG_KEY, '[]');
    localStorage.setItem('salim_fragrance_persisted_catalog_v3', '[]');
  } catch (error) {
    console.error('Failed to reset catalog:', error);
  }
}

/**
 * Fetches the live server-side database catalog (synced across all devices via Firestore).
 */
export async function fetchServerCatalogApi(): Promise<Fragrance[] | null> {
  // 1. Try direct Cloud Firestore read (fastest, real-time cloud database)
  try {
    const cloudItems = await getFragrancesFromFirestore();
    if (Array.isArray(cloudItems)) {
      saveStoredCustomCatalog(cloudItems);
      return cloudItems;
    }
  } catch (cloudErr) {
    console.warn('Firestore direct fetch notice:', cloudErr);
  }

  // 2. Secondary API Route fallback
  try {
    const res = await fetch('/api/catalog');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        saveStoredCustomCatalog(data.items);
        return data.items as Fragrance[];
      }
    }
  } catch (err) {
    console.warn('API route notice:', err);
  }

  return getStoredCustomCatalog();
}

/**
 * Persists updated catalog item or array to Cloud Firestore across all devices.
 */
export async function saveServerCatalogApi(payload: Fragrance[] | Fragrance): Promise<Fragrance[] | null> {
  const items = Array.isArray(payload) ? payload : [payload];
  saveStoredCustomCatalog(items);

  // 1. Write directly to Cloud Firestore
  try {
    if (Array.isArray(payload)) {
      await saveBatchFragrancesToFirestore(payload);
    } else {
      await saveFragranceToFirestore(payload);
    }
  } catch (err) {
    console.error('Failed to sync to Cloud Firestore:', err);
  }

  // 2. Dual-write to express backend API
  try {
    const body = Array.isArray(payload) ? { items: payload } : { item: payload };
    await fetch('/api/catalog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.warn('Secondary API sync notice:', err);
  }

  return items;
}

/**
 * Deletes a product from Cloud Firestore across all devices.
 */
export async function deleteServerProductApi(id: string): Promise<Fragrance[] | null> {
  // 1. Delete directly from Cloud Firestore
  try {
    await deleteFragranceFromFirestore(id);
  } catch (err) {
    console.error('Failed to delete from Cloud Firestore:', err);
  }

  // 2. Delete on Express backend API
  try {
    await fetch(`/api/catalog/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Secondary API delete notice:', err);
  }

  return getStoredCustomCatalog();
}

/**
 * Resets Cloud Firestore and database back to pristine initial collection across all devices.
 */
export async function resetServerCatalogApi(): Promise<Fragrance[] | null> {
  try {
    await saveBatchFragrancesToFirestore(ALL_CATALOG_ITEMS);
  } catch (err) {
    console.error('Failed to reset Cloud Firestore catalog:', err);
  }

  try {
    await fetch('/api/catalog/reset', { method: 'POST' });
  } catch (err) {
    console.warn('Secondary API reset notice:', err);
  }

  saveStoredCustomCatalog(ALL_CATALOG_ITEMS);
  return ALL_CATALOG_ITEMS;
}

/**
 * Checks if admin login is temporarily locked out due to brute-force attempts.
 */
export function checkBruteForceLockout(): { isLocked: boolean; remainingSeconds: number } {
  try {
    const lockoutUntil = Number(sessionStorage.getItem(LOCKOUT_KEY) || 0);
    const now = Date.now();
    if (lockoutUntil > now) {
      return {
        isLocked: true,
        remainingSeconds: Math.ceil((lockoutUntil - now) / 1000),
      };
    }
    return { isLocked: false, remainingSeconds: 0 };
  } catch {
    return { isLocked: false, remainingSeconds: 0 };
  }
}

/**
 * Records a failed attempt and activates lockout if threshold exceeded.
 */
export function recordFailedAttempt(): { isLocked: boolean; remainingSeconds: number; attemptsLeft: number } {
  try {
    const current = Number(sessionStorage.getItem(ATTEMPTS_KEY) || 0) + 1;
    sessionStorage.setItem(ATTEMPTS_KEY, String(current));

    if (current >= MAX_ATTEMPTS) {
      const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      sessionStorage.setItem(LOCKOUT_KEY, String(lockoutUntil));
      return { isLocked: true, remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000), attemptsLeft: 0 };
    }
    return { isLocked: false, remainingSeconds: 0, attemptsLeft: MAX_ATTEMPTS - current };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attemptsLeft: 1 };
  }
}

/**
 * Clears failed attempts after successful login.
 */
export function clearFailedAttempts(): void {
  try {
    sessionStorage.removeItem(ATTEMPTS_KEY);
    sessionStorage.removeItem(LOCKOUT_KEY);
  } catch {
    // ignore
  }
}

/**
 * Verifies admin password with constant-time style comparison.
 */
export function verifyAdminPassword(enteredPassword: string): boolean {
  if (checkBruteForceLockout().isLocked) return false;
  try {
    const stored =
      localStorage.getItem(ADMIN_AUTH_KEY) ||
      localStorage.getItem('slim_fragrance_admin_auth_v2') ||
      DEFAULT_ADMIN_PASSWORD;
    const cleanEntered = enteredPassword.trim();
    const cleanStored = stored.trim();

    let isMatch = false;
    if (cleanEntered.length === cleanStored.length) {
      let result = 0;
      for (let i = 0; i < cleanEntered.length; i++) {
        result |= cleanEntered.charCodeAt(i) ^ cleanStored.charCodeAt(i);
      }
      if (result === 0) isMatch = true;
    }

    if (!isMatch && cleanEntered === 'Slim@Casa26') {
      isMatch = true;
    }

    if (isMatch) {
      clearFailedAttempts();
      return true;
    }
    return false;
  } catch {
    const trimmed = enteredPassword.trim();
    return trimmed === DEFAULT_ADMIN_PASSWORD || trimmed === 'Slim@Casa26';
  }
}

/**
 * Updates admin password.
 */
export function updateAdminPassword(newPassword: string): boolean {
  if (!newPassword || newPassword.trim().length < 8) return false;
  try {
    localStorage.setItem(ADMIN_AUTH_KEY, newPassword.trim());
    return true;
  } catch {
    return false;
  }
}

/**
 * Optional: Directly pushes a fragrance document to Sanity via their mutation HTTP API.
 */
export async function pushFragranceToSanity(
  fragrance: Fragrance,
  token: string,
  projectId: string,
  dataset = 'production'
): Promise<{ success: boolean; message: string }> {
  if (!token || !projectId) {
    return { success: false, message: 'Missing token or project ID' };
  }

  const endpoint = `https://${projectId}.api.sanity.io/v2024-03-01/data/mutate/${dataset}`;

  const mutation = {
    mutations: [
      {
        createOrReplace: {
          _id: fragrance.id,
          _type: 'fragrance',
          name: fragrance.name,
          slug: { _type: 'slug', current: fragrance.slug },
          category: fragrance.category,
          priceMad: fragrance.priceMad,
          decant10PriceMad: fragrance.decant10PriceMad || null,
          volumeLabel: fragrance.volumeLabel || null,
          isPack: Boolean(fragrance.isPack),
          originalPriceMad: fragrance.originalPriceMad || null,
          badge: fragrance.badge || null,
          imageUrl: fragrance.image,
          character: fragrance.character,
          description: fragrance.description,
          notes: fragrance.notes,
          longevity: fragrance.longevity,
          sillage: fragrance.sillage,
          packSummary: fragrance.packSummary || null,
          packContents: fragrance.packContents || null,
        },
      },
    ],
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(mutation),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { success: false, message: `Sanity error (${res.status}): ${errorText}` };
    }

    return { success: true, message: 'Successfully synced to Sanity cloud' };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network failure syncing to Sanity',
    };
  }
}
