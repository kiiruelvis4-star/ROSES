/**
 * Little Roses Academy - Robust Image Storage
 * 
 * Uses IndexedDB to store full-resolution photos without the 5MB localStorage quota limit.
 * Preserves 100% original quality, colors, and brightness.
 */

const DB_NAME = 'lra_image_store';
const STORE_NAME = 'splash_images';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB not supported'));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

export async function saveCustomSplashImage(key: string, dataUrl: string): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(dataUrl, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Failed to save image to IndexedDB, attempting localStorage fallback', e);
  }

  // Also attempt localStorage fallback if under quota
  try {
    localStorage.setItem(`lra_idb_${key}`, dataUrl);
  } catch {
    // Quota exceeded in localStorage is fine since IndexedDB has it
  }
}

export async function loadCustomSplashImage(key: string): Promise<string | null> {
  try {
    const db = await getDB();
    const result = await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
    if (result) return result;
  } catch {
    // Fallback to localStorage
  }

  try {
    return localStorage.getItem(`lra_idb_${key}`);
  } catch {
    return null;
  }
}

export async function clearCustomSplashImage(key: string): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
  } catch {
    // Ignore
  }
  try {
    localStorage.removeItem(`lra_idb_${key}`);
  } catch {
    // Ignore
  }
}
