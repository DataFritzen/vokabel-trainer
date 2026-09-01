import { verbProfiles } from '@/lib/grammar-content';
import { isDue, masteryPercent, newCard } from '@/lib/scheduler';
import type {
  SerializedCard,
  VerbFormKey,
  VocabularyItem,
  VocabularyReadiness,
  WordSkillArea,
} from '@/lib/types';

export type VocabularyTrainingMode =
  | 'smart'
  | 'meaning'
  | 'sentences'
  | 'forms'
  | 'mix';
export type VerbFormFilter = VerbFormKey | 'weighted';

export type VocabularyTrainingTask = {
  id: string;
  word: VocabularyItem;
  skill: WordSkillArea;
  verbForm?: VerbFormKey;
  label: string;
  prompt: string;
  answer: string;
  alternatives?: string[];
  hint?: string;
  explanation: string;
};

export const verbFormLabels: Record<VerbFormKey, string> = {
  present: 'Präsens',
  past: 'Vergangenheit',
  perfect: 'Perfekt',
  future: 'Zukunft',
  negative: 'Verneinung',
};

export const verbFormWeights: Record<VerbFormKey, number> = {
  present: 35,
  past: 25,
  perfect: 18,
  negative: 12,
  future: 10,
};

export function ensureVocabularySkillCards(
  word: VocabularyItem,
  now = new Date(),
): VocabularyItem {
  const formKeys = Object.keys(verbFormWeights) as VerbFormKey[];
  const forms =
    word.skillCards?.forms ??
    (word.partOfSpeech === 'verb'
      ? Object.fromEntries(formKeys.map((key) => [key, newCard(now)]))
      : {});
  return {
    ...word,
    skillCards: {
      sentences: word.skillCards?.sentences ?? newCard(now),
      forms,
    },
  };
}

export function taskCard(task: VocabularyTrainingTask): SerializedCard {
  if (task.skill === 'meaning') return task.word.card;
  if (task.skill === 'sentences')
    return task.word.skillCards?.sentences ?? task.word.card;
  return (
    (task.verbForm && task.word.skillCards?.forms[task.verbForm]) ||
    task.word.card
  );
}

export function wordMastery(word: VocabularyItem) {
  const meaning = masteryPercent(word.card);
  const sentences =
    word.exampleTarget || word.responseTarget
      ? masteryPercent(word.skillCards?.sentences ?? word.card)
      : null;
  const formEntries = Object.entries(word.skillCards?.forms ?? {}) as Array<
    [VerbFormKey, SerializedCard]
  >;
  const forms = formEntries.length
    ? Math.round(
        formEntries.reduce(
          (sum, [key, card]) =>
            sum + masteryPercent(card) * verbFormWeights[key],
          0,
        ) / formEntries.reduce((sum, [key]) => sum + verbFormWeights[key], 0),
      )
    : null;
  const available = [
    { value: meaning, weight: 0.4 },
    ...(sentences === null ? [] : [{ value: sentences, weight: 0.35 }]),
    ...(forms === null ? [] : [{ value: forms, weight: 0.25 }]),
  ];
  const totalWeight = available.reduce((sum, item) => sum + item.weight, 0);
  const overall = Math.round(
    available.reduce((sum, item) => sum + item.value * item.weight, 0) /
      totalWeight,
  );
  const required = [
    meaning,
    ...(sentences === null ? [] : [sentences]),
    ...(forms === null ? [] : [forms]),
  ];
  return {
    meaning,
    sentences,
    forms,
    overall: Math.min(overall, Math.min(...required) + 20),
  };
}

export function vocabularyReadiness(word: VocabularyItem): VocabularyReadiness {
  if (word.card.reps === 0 && !word.placementStatus) return 'unassessed';
  if (word.placementStatus === 'known' && word.card.lapses === 0)
    return 'deepening';
  if (
    !word.placementStatus &&
    word.card.reps === 1 &&
    word.card.scheduled_days >= 6 &&
    word.card.difficulty <= 3
  )
    return 'deepening';
  if (word.card.reps >= 2 && masteryPercent(word.card) >= 50)
    return 'deepening';
  return 'basic';
}

export function vocabularyReadinessCounts(words: VocabularyItem[]) {
  return words.reduce<Record<VocabularyReadiness, number>>(
    (counts, word) => {
      counts[vocabularyReadiness(word)] += 1;
      return counts;
    },
    { unassessed: 0, basic: 0, deepening: 0 },
  );
}

function meaningTask(word: VocabularyItem): VocabularyTrainingTask {
  return {
    id: `${word.id}-meaning`,
    word,
    skill: 'meaning',
    label: 'Wort & Bedeutung',
    prompt: word.target,
    answer: word.translation,
    explanation: word.exampleTarget
      ? `${word.exampleTarget} – ${word.exampleTranslation}`
      : `Grundbedeutung: ${word.translation}`,
  };
}

function sentenceTask(word: VocabularyItem): VocabularyTrainingTask | null {
  if (word.responseTarget)
    return {
      id: `${word.id}-sentences`,
      word,
      skill: 'sentences',
      label: 'Im Satz',
      prompt: `Wie antwortest du passend auf „${word.target}“?`,
      answer: word.responseTarget,
      explanation: word.responseTranslation ?? 'Passende Gesprächsantwort.',
    };
  if (!word.exampleTarget || !word.exampleTranslation) return null;
  return {
    id: `${word.id}-sentences`,
    word,
    skill: 'sentences',
    label: 'Im Satz',
    prompt: `Übersetze: „${word.exampleTranslation}“`,
    answer: word.exampleTarget,
    explanation: `Modelllösung: ${word.exampleTarget}`,
  };
}

function formTask(
  word: VocabularyItem,
  form: VerbFormKey,
): VocabularyTrainingTask | null {
  const profile = word.verbProfileId
    ? verbProfiles[word.verbProfileId]
    : undefined;
  if (!profile) return null;
  const values: Record<VerbFormKey, string> = {
    present: profile.firstPresent,
    past: profile.past,
    perfect: profile.perfect,
    future: profile.future,
    negative: profile.negativeI,
  };
  const timeHints: Record<VerbFormKey, string> = {
    present: 'ni-na-',
    past: 'ni-li-',
    perfect: 'ni-me-',
    future: 'ni-ta-',
    negative: 'negative Ich-Form',
  };
  return {
    id: `${word.id}-forms-${form}`,
    word,
    skill: 'forms',
    verbForm: form,
    label: `Formen · ${verbFormLabels[form]}`,
    prompt: `Bilde die Ich-Form von ${profile.infinitive} (${profile.meaning}) – ${verbFormLabels[form]}.`,
    answer: `${values[form]}.`,
    alternatives: [values[form]],
    hint: timeHints[form],
    explanation: `${verbFormLabels[form]}: ${values[form]}.`,
  };
}

function priority(task: VocabularyTrainingTask) {
  const card = taskCard(task);
  const usage = task.verbForm
    ? verbFormWeights[task.verbForm]
    : task.skill === 'meaning'
      ? 30
      : 22;
  const curriculum =
    task.word.curriculum?.role === 'core'
      ? 10
      : task.word.curriculum?.role === 'enrichment'
        ? -8
        : 0;
  return (
    (isDue(card) ? 90 : 0) +
    (100 - masteryPercent(card)) +
    usage +
    curriculum +
    card.lapses * 8
  );
}

export function buildVocabularyTrainingTasks(
  words: VocabularyItem[],
  mode: VocabularyTrainingMode,
  formFilter: VerbFormFilter = 'weighted',
  limit = 7,
) {
  const byWord = words
    .filter((word) => vocabularyReadiness(word) === 'deepening')
    .map((word) => {
      const choices: VocabularyTrainingTask[] = [];
      const meaning = meaningTask(word);
      const sentence = sentenceTask(word);
      const meaningReady =
        word.card.reps >= 1 || masteryPercent(word.card) >= 30;

      if (mode === 'meaning') choices.push(meaning);
      if (mode === 'sentences' && sentence) choices.push(sentence);
      if (mode === 'forms' || mode === 'smart' || mode === 'mix') {
        const forms =
          formFilter === 'weighted'
            ? (Object.keys(verbFormWeights) as VerbFormKey[])
            : [formFilter];
        choices.push(
          ...forms
            .map((form) => formTask(word, form))
            .filter((task): task is VocabularyTrainingTask => Boolean(task)),
        );
      }
      if (mode === 'smart') {
        choices.push(meaning);
        if (meaningReady && sentence) choices.push(sentence);
      }
      if (mode === 'mix') {
        choices.push(meaning);
        if (sentence) choices.push(sentence);
      }

      const eligible =
        mode === 'smart' && !meaningReady
          ? choices.filter((task) => task.skill === 'meaning')
          : choices;
      return eligible.sort((a, b) => priority(b) - priority(a))[0];
    })
    .filter((task): task is VocabularyTrainingTask => Boolean(task));

  return byWord
    .sort(
      (a, b) => priority(b) - priority(a) || a.word.id.localeCompare(b.word.id),
    )
    .slice(0, limit);
}
