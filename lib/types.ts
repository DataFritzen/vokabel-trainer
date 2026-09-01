export type LanguageCode = 'sw' | 'es';
export type WordSkillArea = 'meaning' | 'forms' | 'sentences';
export type VerbFormKey =
  | 'present'
  | 'past'
  | 'perfect'
  | 'future'
  | 'negative';
export type VocabularyReadiness = 'unassessed' | 'basic' | 'deepening';
export type CurriculumRole =
  | 'core'
  | 'helper'
  | 'sentence-model'
  | 'grammar-variant'
  | 'enrichment';

export type SerializedCard = {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review?: string;
};

export type VocabularyItem = {
  id: string;
  language: LanguageCode;
  target: string;
  translation: string;
  category: string;
  exampleTarget?: string;
  exampleTranslation?: string;
  mnemonicSuggestion?: string;
  personalMnemonic?: string;
  morphemes?: string[];
  notes?: string;
  sourceText?: string;
  needsReview?: boolean;
  learningStatus?: 'planned' | 'active' | 'archived';
  cefrLevel?: 'A1' | 'A2' | 'B1';
  learningPackId?: string;
  placementStatus?: 'learning' | 'known';
  curriculum?: {
    unitId: string;
    role: CurriculumRole;
    priority: 'now' | 'soon' | 'later';
    linkedVocabularyId?: string;
    rationale: string;
  };
  responseTarget?: string;
  responseTranslation?: string;
  nounClass?: string;
  languageGuidance?: {
    standard: string;
    why: string;
    commonMistake: string;
    register: 'neutral' | 'polite' | 'respectful' | 'informal';
    localUsage: string;
    regionalStatus: 'standard-safe' | 'local-verified' | 'local-review';
    useMode: 'active' | 'recognition';
    sourceLabel: string;
    sourceUrl: string;
  };
  partOfSpeech?: 'verb' | 'noun' | 'pronoun' | 'phrase' | 'adverb' | 'other';
  lemma?: string;
  verbProfileId?: string;
  grammarForms?: {
    infinitive: string;
    stem: string;
    meaning: string;
    firstPresent: string;
    you: string;
    we: string;
    negativeI: string;
    objectPerspective?: boolean;
  };
  verification?: {
    status: 'verified' | 'corrected' | 'nuance';
    note: string;
  };
  imageMediaId?: string;
  audioMediaId?: string;
  card: SerializedCard;
  skillCards?: {
    sentences: SerializedCard;
    forms: Partial<Record<VerbFormKey, SerializedCard>>;
  };
  createdAt: string;
  updatedAt: string;
};

export type GrammarExercise = {
  id: string;
  lessonId: string;
  vocabularyId?: string;
  kind: 'build' | 'transform' | 'negative' | 'sentence' | 'analyze';
  title: string;
  prompt: string;
  answer: string;
  alternatives?: string[];
  hint?: string;
  explanation: string;
  card: SerializedCard;
};

export type GrammarLesson = {
  id: string;
  level: string;
  title: string;
  summary: string;
  formula: string;
  example: string;
};

export type LearningPack = {
  id: string;
  level: 'A1' | 'A2' | 'B1';
  order: number;
  title: string;
  goal: string;
  vocabularyIds: string[];
  supportingVocabularyIds?: string[];
  prerequisiteIds: string[];
  activation: 'already-active' | 'on-start';
};

export type GrammarReviewEntry = {
  id: string;
  exerciseId: string;
  rating: 1 | 2 | 3 | 4;
  reviewedAt: string;
};

export type ReviewEntry = {
  id: string;
  vocabularyId: string;
  rating: 1 | 2 | 3 | 4;
  reviewedAt: string;
  dayKey?: string;
  roundNumber?: number;
  wasNew?: boolean;
};

export type WordSkillReviewEntry = {
  id: string;
  vocabularyId: string;
  skill: WordSkillArea;
  verbForm?: VerbFormKey;
  rating: 1 | 2 | 3 | 4;
  reviewedAt: string;
  dayKey: string;
};

export type ActiveRound = {
  dayKey: string;
  language: LanguageCode;
  vocabularyIds: string[];
  roundNumber: number;
};

export type AppSettings = {
  activeLanguage: LanguageCode;
  dailyGoal: number;
  targetDate: string;
  targetLevel: 'B1';
  regionalFocus: 'paje-michamvi';
  regionalTrackEnabled: boolean;
  slangTrackEnabled: boolean;
  diagnosticDone: boolean;
  preferUploadedAudio: boolean;
};

export type AppSnapshot = {
  version: 4;
  vocabulary: VocabularyItem[];
  deletedVocabularyIds: string[];
  startedLearningPackIds: string[];
  reviews: ReviewEntry[];
  wordSkillReviews: WordSkillReviewEntry[];
  grammarExercises: GrammarExercise[];
  grammarReviews: GrammarReviewEntry[];
  settings: AppSettings;
  activeRound?: ActiveRound;
};

export type BackupFile = {
  app: 'sema-7';
  exportedAt: string;
  snapshot: AppSnapshot;
  media: Array<{ id: string; type: string; dataUrl: string }>;
};
