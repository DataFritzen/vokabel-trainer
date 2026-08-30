import { createEmptyCard, fsrs, generatorParameters } from 'ts-fsrs';
import type { SerializedCard } from '@/lib/types';

const scheduler = fsrs(generatorParameters({
  request_retention: 0.9,
  maximum_interval: 365,
  enable_fuzz: true,
  enable_short_term: true,
  learning_steps: ['1m', '10m'],
  relearning_steps: ['10m'],
}));

export function newCard(now = new Date()): SerializedCard {
  return serializeCard(createEmptyCard(now));
}

export function schedule(card: SerializedCard, grade: 1 | 2 | 3 | 4, now = new Date()): SerializedCard {
  const hydrated = {
    ...card,
    due: new Date(card.due),
    last_review: card.last_review ? new Date(card.last_review) : undefined,
  };
  return serializeCard(scheduler.next(hydrated, now, grade).card);
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

export const ratingLabels = {
  1: { label: 'Nochmal', hint: '< 1 Min.' },
  2: { label: 'Schwer', hint: 'anstrengend' },
  3: { label: 'Gut', hint: 'gewusst' },
  4: { label: 'Leicht', hint: 'sofort gewusst' },
} as const;
