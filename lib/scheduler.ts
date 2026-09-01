import { createEmptyCard, fsrs, generatorParameters } from 'ts-fsrs';
import type { SerializedCard } from '@/lib/types';

const scheduler = fsrs(generatorParameters({
  request_retention: 0.9,
  maximum_interval: 365,
  enable_fuzz: true,
  // Eine Sitzung wird in Lernrunden statt in Minuten organisiert. FSRS plant
  // hier nur die langfristige Wiederholung in Tagen.
  enable_short_term: false,
  learning_steps: [],
  relearning_steps: [],
}));

export function newCard(now = new Date()): SerializedCard {
  return serializeCard(createEmptyCard(now));
}

export function schedule(card: SerializedCard, grade: 1 | 2 | 3 | 4, now = new Date()): SerializedCard {
  const hydrated = hydrateCard(card);
  return serializeCard(scheduler.next(hydrated, now, grade).card);
}

function hydrateCard(card: SerializedCard) {
  return {
    ...card,
    due: new Date(card.due),
    last_review: card.last_review ? new Date(card.last_review) : undefined,
  };
}

export function serializeCard(card: {
  due: Date; stability: number; difficulty: number; elapsed_days: number;
  scheduled_days: number; learning_steps: number; reps: number; lapses: number;
  state: number; last_review?: Date;
}): SerializedCard {
  return {
    ...card,
    due: card.due.toISOString(),
    last_review: card.last_review?.toISOString(),
  };
}

export function isDue(card: SerializedCard, now = new Date()) {
  return new Date(card.due).getTime() <= now.getTime();
}

export function masteryPercent(card: SerializedCard, now = new Date()) {
  if (card.reps === 0) return 0;
  const retrievability = scheduler.get_retrievability(hydrateCard(card), now, false);
  const experience = Math.min(1, card.reps / 4);
  const stability = Math.min(1, card.stability / 14);
  return Math.max(1, Math.min(100, Math.round(retrievability * (experience * .7 + stability * .3) * 100)));
}

export function intervalLabel(card: SerializedCard, grade: 1 | 2 | 3 | 4, now = new Date()) {
  const next = schedule(card, grade, now);
  const days = Math.max(1, Math.ceil((new Date(next.due).getTime() - now.getTime()) / 86_400_000));
  return days === 1 ? 'morgen' : `in ${days} Tagen`;
}

export const ratingLabels = {
  1: { label: 'Nochmal' },
  2: { label: 'Schwer' },
  3: { label: 'Gut' },
  4: { label: 'Leicht' },
} as const;
