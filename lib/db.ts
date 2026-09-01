'use client';

import { createSeedVocabulary } from '@/lib/seed-vocabulary';
import { createGrammarExercises } from '@/lib/grammar-content';
import { learningPacks } from '@/lib/curriculum';
import { ensureVocabularySkillCards } from '@/lib/vocabulary-training';
import type { AppSnapshot, BackupFile } from '@/lib/types';
import { auditVocabulary } from '@/lib/vocabulary-audit';

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
  const plannedIds = new Set(
    learningPacks
      .filter((pack) => pack.activation === 'on-start')
      .flatMap((pack) => pack.vocabularyIds),
  );
  const vocabulary = createSeedVocabulary().map((word) =>
    ensureVocabularySkillCards({
      ...word,
      learningStatus: plannedIds.has(word.id) ? 'planned' : word.learningStatus,
    }),
  );
  return {
    version: 4,
    vocabulary,
    deletedVocabularyIds: [],
    startedLearningPackIds: [],
    reviews: [],
    wordSkillReviews: [],
    grammarExercises: createGrammarExercises(vocabulary),
    grammarReviews: [],
    settings: {
      activeLanguage: 'sw',
      dailyGoal: 7,
      targetDate: '2026-12-01',
      targetLevel: 'B1',
      regionalFocus: 'paje-michamvi',
      regionalTrackEnabled: true,
      slangTrackEnabled: true,
      diagnosticDone: false,
      preferUploadedAudio: true,
    },
  };
}

type LegacySnapshot = Omit<
  AppSnapshot,
  | 'version'
  | 'grammarExercises'
  | 'grammarReviews'
  | 'deletedVocabularyIds'
  | 'startedLearningPackIds'
  | 'wordSkillReviews'
> & {
  version: 1 | 2 | 3 | 4;
  grammarExercises?: AppSnapshot['grammarExercises'];
  grammarReviews?: AppSnapshot['grammarReviews'];
  deletedVocabularyIds?: string[];
  startedLearningPackIds?: string[];
  wordSkillReviews?: AppSnapshot['wordSkillReviews'];
};

function migrateSnapshot(raw: LegacySnapshot): AppSnapshot {
  const seed = createSeedVocabulary();
  const deletedVocabularyIds = raw.deletedVocabularyIds ?? [];
  const deletedIds = new Set(deletedVocabularyIds);
  const existingIds = new Set(raw.vocabulary.map((word) => word.id));
  const startedLearningPackIds =
    raw.startedLearningPackIds ??
    learningPacks
      .filter((pack) =>
        pack.vocabularyIds.some(
          (id) =>
            raw.reviews.some((review) => review.vocabularyId === id) ||
            raw.activeRound?.vocabularyIds.includes(id) ||
            raw.vocabulary.find((word) => word.id === id)?.card.reps,
        ),
      )
      .map((pack) => pack.id);
  const startedIds = new Set(startedLearningPackIds);
  const vocabulary = auditVocabulary([
    ...raw.vocabulary,
    ...seed.filter(
      (word) => !existingIds.has(word.id) && !deletedIds.has(word.id),
    ),
  ]).map((word) =>
    ensureVocabularySkillCards({
      ...word,
      learningStatus:
        raw.version < 4 &&
        word.learningPackId &&
        !startedIds.has(word.learningPackId)
          ? 'planned'
          : word.learningStatus,
    }),
  );
  const generated = createGrammarExercises(vocabulary);
  const storedById = new Map(
    (raw.grammarExercises ?? []).map((exercise) => [exercise.id, exercise]),
  );
  const grammarExercises = generated.map((exercise) => {
    const stored = storedById.get(exercise.id);
    return stored ? { ...exercise, card: stored.card } : exercise;
  });
  return {
    ...raw,
    version: 4,
    vocabulary,
    deletedVocabularyIds,
    startedLearningPackIds,
    wordSkillReviews: raw.wordSkillReviews ?? [],
    grammarExercises,
    grammarReviews: raw.grammarReviews ?? [],
    settings: {
      ...raw.settings,
      targetLevel: raw.settings.targetLevel ?? 'B1',
      regionalFocus: raw.settings.regionalFocus ?? 'paje-michamvi',
      regionalTrackEnabled: raw.settings.regionalTrackEnabled ?? true,
      slangTrackEnabled: raw.settings.slangTrackEnabled ?? true,
    },
  };
}

export async function loadSnapshot(): Promise<AppSnapshot> {
  const db = await openDb();
  const tx = db.transaction('app', 'readwrite');
  const store = tx.objectStore('app');
  const existing = (await request(store.get(APP_KEY))) as
    | LegacySnapshot
    | undefined;
  if (existing) {
    const migrated = migrateSnapshot(existing);
    await request(store.put(migrated, APP_KEY));
    return migrated;
  }
  const initial = createInitialSnapshot();
  await request(store.put(initial, APP_KEY));
  return initial;
}

export async function saveSnapshot(snapshot: AppSnapshot) {
  const db = await openDb();
  await request(
    db
      .transaction('app', 'readwrite')
      .objectStore('app')
      .put(snapshot, APP_KEY),
  );
}

export async function saveMedia(id: string, blob: Blob) {
  const db = await openDb();
  await request(
    db.transaction('media', 'readwrite').objectStore('media').put(blob, id),
  );
}

export async function getMedia(id?: string): Promise<Blob | undefined> {
  if (!id) return undefined;
  const db = await openDb();
  return request(db.transaction('media').objectStore('media').get(id));
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(typeof reader.result === 'string' ? reader.result : '');
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
  const ids = await request(
    db.transaction('media').objectStore('media').getAllKeys(),
  );
  const media = await Promise.all(
    ids.map(async (key) => {
      const id = typeof key === 'string' ? key : JSON.stringify(key);
      const blob = await getMedia(id);
      return {
        id,
        type: blob?.type ?? '',
        dataUrl: blob ? await blobToDataUrl(blob) : '',
      };
    }),
  );
  return {
    app: 'sema-7',
    exportedAt: new Date().toISOString(),
    snapshot,
    media,
  };
}

export async function restoreBackup(backup: BackupFile) {
  const raw = backup.snapshot as unknown as LegacySnapshot;
  if (backup.app !== 'sema-7' || !raw || ![1, 2, 3, 4].includes(raw.version))
    throw new Error('Diese Datei ist kein gültiges Sema-7-Backup.');
  const migrated = migrateSnapshot(raw);
  const db = await openDb();
  await request(
    db
      .transaction('app', 'readwrite')
      .objectStore('app')
      .put(migrated, APP_KEY),
  );
  const tx = db.transaction('media', 'readwrite');
  tx.objectStore('media').clear();
  for (const media of backup.media ?? [])
    tx.objectStore('media').put(dataUrlToBlob(media.dataUrl), media.id);
  return migrated;
}
