import { Injectable } from '@angular/core';

/** How long party-day data stays on the device: the week before the party. */
export const offlineDays = 7;
const dayMs = 86_400_000;

interface Stored {
  value: unknown;
  savedAt: number;
}

/**
 * A small key-value store in IndexedDB for what must work without a connection: the run sheet,
 * contacts, the allergy list, the checklist and changes waiting to sync. Entries older than seven
 * days are treated as gone. Nothing here throws: without IndexedDB the device simply has no copy.
 */
@Injectable({ providedIn: 'root' })
export class OfflineStore {
  private database: Promise<IDBDatabase | null> | null = null;

  async get<T>(key: string): Promise<T | null> {
    const stored = await this.run<Stored | undefined>('readonly', (store) => store.get(key));
    return stored && Date.now() - stored.savedAt < offlineDays * dayMs ? (stored.value as T) : null;
  }

  async set(key: string, value: unknown): Promise<void> {
    await this.run('readwrite', (store) => store.put({ value, savedAt: Date.now() }, key));
  }

  async delete(key: string): Promise<void> {
    await this.run('readwrite', (store) => store.delete(key));
  }

  private async run<T>(
    mode: IDBTransactionMode,
    action: (store: IDBObjectStore) => IDBRequest,
  ): Promise<T | undefined> {
    const db = await this.open();
    if (!db) return undefined;
    return new Promise((resolve) => {
      try {
        const request = action(db.transaction('kv', mode).objectStore('kv'));
        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () => resolve(undefined);
      } catch {
        resolve(undefined);
      }
    });
  }

  private open(): Promise<IDBDatabase | null> {
    this.database ??= new Promise((resolve) => {
      try {
        const request = indexedDB.open('giddy-offline', 1);
        request.onupgradeneeded = () => request.result.createObjectStore('kv');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
    return this.database;
  }
}
