/**
 * Little Roses Academy - Resource File Storage Engine
 * 
 * Stores full-fidelity PDFs, Office documents, spreadsheets, images,
 * and media in IndexedDB with in-memory caching.
 * Bypasses the 5MB browser localStorage quota completely.
 */

const DB_NAME = 'lra_resources_file_store';
const STORE_NAME = 'resource_files';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;
const memoryCache = new Map<string, string>();

function getDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB is not available in this environment'));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          console.warn('[ResourceStorage] IndexedDB open error:', request.error);
          reject(request.error);
        };
      } catch (err) {
        reject(err);
      }
    });
  }
  return dbPromise;
}

export async function saveResourceFile(
  docId: string,
  fileData: string,
  _mimeType?: string,
  _fileName?: string
): Promise<void> {
  if (!docId || !fileData) return;

  // 1. Immediately store in fast memory cache
  memoryCache.set(docId, fileData);

  // 2. Persist to IndexedDB
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(fileData, docId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[ResourceStorage] Could not persist to IndexedDB, stored in memory cache:', err);
  }
}

export async function loadResourceFile(docId: string): Promise<string | null> {
  if (!docId) return null;

  // 1. Check memory cache first
  if (memoryCache.has(docId)) {
    return memoryCache.get(docId) || null;
  }

  // 2. Load from IndexedDB
  try {
    const db = await getDB();
    const result = await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(docId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });

    if (result) {
      memoryCache.set(docId, result);
      return result;
    }
  } catch (err) {
    console.warn('[ResourceStorage] Could not load from IndexedDB:', err);
  }

  return null;
}

export function getCachedResourceFile(docId: string): string | null {
  return memoryCache.get(docId) || null;
}

export async function deleteResourceFile(docId: string): Promise<void> {
  if (!docId) return;
  memoryCache.delete(docId);

  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(docId);
  } catch (err) {
    console.warn('[ResourceStorage] Could not delete from IndexedDB:', err);
  }
}
