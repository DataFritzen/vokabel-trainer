import type { CurriculumRole, VocabularyItem } from '@/lib/types';

type CurriculumMeta = NonNullable<VocabularyItem['curriculum']>;

const unitCoreIds: Record<string, string[]> = {
  'a1-everyday-verbs': [
    'sw-001',
    'sw-002',
    'sw-003',
    'sw-004',
    'sw-005',
    'sw-006',
    'sw-038',
  ],
  'a1-day-times': [
    'sw-007',
    'sw-008',
    'sw-009',
    'sw-010',
    'sw-011',
    'sw-012',
    'sw-055',
  ],
  'a1-weekdays': [
    'sw-013',
    'sw-014',
    'sw-015',
    'sw-016',
    'sw-017',
    'sw-018',
    'sw-019',
  ],
  'a1-food-market': [
    'sw-024',
    'sw-025',
    'sw-026',
    'sw-030',
    'sw-031',
    'sw-033',
    'sw-034',
  ],
  'a1-contact-help': [
    'sw-037',
    'sw-040',
    'sw-042',
    'sw-043',
    'sw-044',
    'sw-045',
    'sw-050',
  ],
  'a1-meeting-location': [
    'sw-027',
    'sw-047',
    'sw-049',
    'sw-051',
    'sw-052',
    'sw-053',
    'sw-054',
  ],
};

const supporting: Record<
  string,
  {
    unitId: string;
    role: CurriculumRole;
    linkedVocabularyId?: string;
    priority?: CurriculumMeta['priority'];
    rationale: string;
  }
> = {
  'sw-020': {
    unitId: 'a1-contact-help',
    role: 'helper',
    linkedVocabularyId: 'sw-050',
    rationale:
      'Das betonte Pronomen hilft beim Satzbau, ist aber meist kein eigener Gesprächsbaustein.',
  },
  'sw-021': {
    unitId: 'a1-food-market',
    role: 'sentence-model',
    linkedVocabularyId: 'sw-024',
    rationale:
      'Verbindet gehen und kaufen in einem Modellsatz; die Teilwörter werden separat gefestigt.',
  },
  'sw-022': {
    unitId: 'a1-food-market',
    role: 'grammar-variant',
    linkedVocabularyId: 'sw-024',
    rationale: 'Du-Variante des Kauf-Musters, keine zusätzliche Grundvokabel.',
  },
  'sw-023': {
    unitId: 'a1-food-market',
    role: 'grammar-variant',
    linkedVocabularyId: 'sw-024',
    rationale: 'Wir-Variante des Kauf-Musters, keine zusätzliche Grundvokabel.',
  },
  'sw-028': {
    unitId: 'a1-food-market',
    role: 'sentence-model',
    linkedVocabularyId: 'sw-005',
    rationale:
      'Nützlicher Zwei-Verb-Satz; kupika wird darin als neuer Verbstamm mitgelernt.',
  },
  'sw-029': {
    unitId: 'a1-weekdays',
    role: 'enrichment',
    priority: 'later',
    rationale:
      'Korrekt und nützlich für Zeiträume, aber nach Tagen und einfachen Zeitangaben wichtiger.',
  },
  'sw-032': {
    unitId: 'a1-food-market',
    role: 'grammar-variant',
    linkedVocabularyId: 'sw-033',
    rationale: 'Zeigt die positive und negative Satzschablone rund um njaa.',
  },
  'sw-035': {
    unitId: 'a1-contact-help',
    role: 'enrichment',
    priority: 'later',
    rationale:
      'Korrektes Gefühlswort, für die ersten Reisegespräche aber weniger dringend.',
  },
  'sw-036': {
    unitId: 'a1-contact-help',
    role: 'enrichment',
    priority: 'later',
    rationale:
      'Korrektes Gefühlswort, für die ersten Reisegespräche aber weniger dringend.',
  },
  'sw-039': {
    unitId: 'a1-meeting-location',
    role: 'sentence-model',
    linkedVocabularyId: 'sw-052',
    priority: 'soon',
    rationale:
      'Nützlicher Treff-Satz mit der fortgeschritteneren Ortsform ulipo.',
  },
  'sw-041': {
    unitId: 'a1-contact-help',
    role: 'grammar-variant',
    linkedVocabularyId: 'sw-045',
    rationale:
      'Verkürzte Alltagsvariante von Ninakupa; beide Formen gehören zu einem Lernziel.',
  },
  'sw-046': {
    unitId: 'a1-meeting-location',
    role: 'grammar-variant',
    linkedVocabularyId: 'sw-051',
    priority: 'soon',
    rationale:
      'Perfektvariante von kuona; sie gehört ins Zeitentraining statt als neues Wort gezählt zu werden.',
  },
  'sw-048': {
    unitId: 'a1-meeting-location',
    role: 'grammar-variant',
    linkedVocabularyId: 'sw-047',
    rationale:
      'Wir-Variante von tayari und damit Grammatiktransfer statt neues Lexem.',
  },
};

const coreRationale: Record<string, string> = {
  'a1-everyday-verbs':
    'Hochfrequenter Kernbaustein für eigene Aussagen über Alltag und Absichten.',
  'a1-day-times':
    'Direkt einsetzbarer Zeit- oder Grußbaustein für Tagesgespräche.',
  'a1-weekdays':
    'Teil des vollständigen Wochentag-Systems und gemeinsam leichter abrufbar.',
  'a1-food-market': 'Unmittelbar nützlich für Essen, Bestellen und Einkaufen.',
  'a1-contact-help':
    'Trägt kurze soziale Gespräche, Bitten und Hilfehandlungen.',
  'a1-meeting-location': 'Hilft beim Verabreden, Finden und Zurückkommen.',
};

export function curriculumMetaFor(id: string): CurriculumMeta | undefined {
  for (const [unitId, ids] of Object.entries(unitCoreIds)) {
    if (ids.includes(id))
      return {
        unitId,
        role: 'core',
        priority: 'now',
        rationale: coreRationale[unitId],
      };
  }
  const item = supporting[id];
  if (!item) return undefined;
  return {
    ...item,
    priority: item.priority ?? (item.role === 'enrichment' ? 'later' : 'soon'),
  };
}

export const originalCurriculumIds = [
  ...Object.values(unitCoreIds).flat(),
  ...Object.keys(supporting),
];

export const curriculumRoleLabels: Record<CurriculumRole, string> = {
  core: 'Kernbaustein',
  helper: 'Hilfswort',
  'sentence-model': 'Satzmuster',
  'grammar-variant': 'Grammatikvariante',
  enrichment: 'Spätere Ergänzung',
};

export function curriculumOrder(word: VocabularyItem) {
  const unitOrder = ['a1-greetings', ...Object.keys(unitCoreIds)];
  const roleOrder: CurriculumRole[] = [
    'core',
    'helper',
    'sentence-model',
    'grammar-variant',
    'enrichment',
  ];
  const unitIndex = unitOrder.indexOf(
    word.curriculum?.unitId ?? word.learningPackId ?? '',
  );
  const numericId = Number(word.id.split('-')[1]);
  return (
    (unitIndex < 0 ? unitOrder.length + 1 : unitIndex + 1) * 1000 +
    (roleOrder.indexOf(word.curriculum?.role ?? 'core') + 1) * 10 +
    (Number.isFinite(numericId) ? numericId : 999)
  );
}
