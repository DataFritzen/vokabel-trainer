'use client';

import { createSeedVocabulary } from '@/lib/seed-vocabulary';
import type { AppSnapshot, BackupFile } from '@/lib/types';

const DB_NAME = 'sema-7';
const DB_VERSION = 1;
const APP_KEY = 'snapshot';

function request<T>(value: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    value.onsuccess = () => resolve(value.result);
    value.onerror = () => reject(value.error);
  });
}

async function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const opening = indexedDB.open(DB_NAME, DB_VERSION);
    opening.onupgradeneeded = () => {
      const db = opening.result;
      if (!db.objectStoreNames.contains('app')) db.createObjectStore('app');
      if (!db.objectStoreNames.contains('media')) db.createObjectStore('media');
    };
    opening.onsuccess = () => resolve(opening.result);
    opening.onerror = () => reject(opening.error);
  });
}

export function createInitialSnapshot(): AppSnapshot {
  return {
    version: 1,
    vocabulary: createSeedVocabulary(),
    reviews: [],
    settings: {
      activeLanguage: 'sw',
      dailyGoal: 7,
      targetDate: '2026-12-01',
      diagnosticDone: false,
      preferUploadedAudio: true,
    },
  };
}

export async function loadSnapshot(): Promise<AppSnapshot> {
  const db = await openDb();
  const tx = db.transaction('app', 'readwrite');
  const store = tx.objectStore('app');
  const existing = await request(store.get(APP_KEY)) as AppSnapshot | undefined;
  if (existing) return existing;
  const initial = createInitialSnapshot();
  await request(store.put(initial, APP_KEY));
  return initial;
}

export async function saveSnapshot(snapshot: AppSnapshot) {
  const db = await openDb();
  await request(db.transaction('app', 'readwrite').objectStore('app').put(snapshot, APP_KEY));
}

export async function saveMedia(id: string, blob: Blob) {
  const db = await openDb();
  await request(db.transaction('media', 'readwrite').objectStore('media').put(blob, id));
}

export async function getMedia(id?: string): Promise<Blob | undefined> {
  if (!id) return undefined;
  const db = await openDb();
  return request(db.transaction('media').objectStore('media').get(id));
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function dataUrlToBlob(dataUrl: string) {
  const [meta, value] = dataUrl.split(',');
  const type = meta.match(/data:(.*?);/)?.[1] ?? 'application/octet-stream';
  const bytes = Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
  return new Blob([bytes], { type });
}

export async function createBackup(snapshot: AppSnapshot): Promise<BackupFile> {
  const db = await openDb();
  const ids = await request(db.transaction('media').objectStore('media').getAllKeys());
  const media = await Promise.all(ids.map(async (key) => {
    const id = typeof key === 'string' ? key : JSON.stringify(key);
    const blob = await getMedia(id);
    return { id, type: blob?.type ?? '', dataUrl: blob ? await blobToDataUrl(blob) : '' };
  }));
  return { app: 'sema-7', exportedAt: new Date().toISOString(), snapshot, media };
}

export async function restoreBackup(backup: BackupFile) {
  if (backup.app !== 'sema-7' || backup.snapshot?.version !== 1) throw new Error('Diese Datei ist kein gültiges Sema-7-Backup.');
  const db = await openDb();
  await request(db.transaction('app', 'readwrite').objectStore('app').put(backup.snapshot, APP_KEY));
  const tx = db.transaction('media', 'readwrite');
  tx.objectStore('media').clear();
  for (const media of backup.media ?? []) tx.objectStore('media').put(dataUrlToBlob(media.dataUrl), media.id);
  return backup.snapshot;
}
