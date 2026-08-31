import type { VocabularyItem } from '@/lib/types';

export type LearningStage = 'new' | 'learning' | 'stable' | 'safe';

export const learningStageMeta: Record<LearningStage, { label: string; shortLabel: string; weight: number }> = {
  new: { label: 'Neu', shortLabel: 'neu', weight: 0 },
  learning: { label: 'Im Lernen', shortLabel: 'im Lernen', weight: .3 },
  stable: { label: 'Schon stabil', shortLabel: 'stabil', weight: .7 },
  safe: { label: 'Sicher abrufbar', shortLabel: 'sicher', weight: 1 },
};

export function learningStage(word: VocabularyItem): LearningStage {
  if (word.card.reps === 0) return 'new';
  if (word.card.state === 2 && word.card.reps >= 3 && word.card.stability >= 14) return 'safe';
  if (word.card.state === 2 && word.card.reps >= 2) return 'stable';
  return 'learning';
}
