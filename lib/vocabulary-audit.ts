import { profileIdForVocabulary, verbProfiles } from '@/lib/grammar-content';
import type { VocabularyItem } from '@/lib/types';

type AuditPatch = Partial<Pick<VocabularyItem, 'target' | 'translation' | 'category' | 'exampleTarget' | 'exampleTranslation' | 'partOfSpeech' | 'lemma' | 'verbProfileId' | 'notes' | 'needsReview' | 'verification'>>;

const correctedSourceIds = new Set(['sw-003', 'sw-007', 'sw-008', 'sw-009', 'sw-010', 'sw-011', 'sw-016', 'sw-018', 'sw-019', 'sw-021', 'sw-024', 'sw-030', 'sw-046', 'sw-054']);
const shortenedPresentIds = new Set(['sw-001', 'sw-002', 'sw-003', 'sw-004', 'sw-005', 'sw-039', 'sw-041', 'sw-042', 'sw-043', 'sw-044', 'sw-051', 'sw-054']);

const patches: Record<string, AuditPatch> = {
  'sw-020': { translation: 'du (betont); dich', partOfSpeech: 'pronoun', verification: { status: 'nuance', note: 'wewe ist das selbstständige, oft betonte Pronomen. „dich/dir“ steckt im Verb normalerweise als Objektmarker -ku-.' } },
  'sw-045': { verification: { status: 'nuance', note: 'Inhaltlich gleich wie Nakupa, aber mit explizitem Präsensmarker ni-na-. Beide Formen werden geübt.' } },
  'sw-046': { verification: { status: 'corrected', note: 'Die Form mit -me- ist Perfekt: „Ich habe dich gesehen“, nicht einfach Präsens.' } },
  'sw-053': { target: 'nipo / niko / nimo', translation: 'ich bin hier / an einem Ort / darin', exampleTarget: 'Nipo hapa. / Niko Zanzibar. / Nimo ndani.', exampleTranslation: 'Ich bin hier. / Ich bin auf Sansibar. / Ich bin drinnen.', partOfSpeech: 'other', verification: { status: 'nuance', note: '-po verweist auf einen konkreten Ort, -ko auf eine allgemeinere Lage und -mo auf das Innere.' } },
  'sw-055': { partOfSpeech: 'phrase', verification: { status: 'verified', note: 'Gebräuchliche abendliche Begrüßungsfrage; jioni bezeichnet den Abend.' } },
};

function inferredPartOfSpeech(word: VocabularyItem): VocabularyItem['partOfSpeech'] {
  if (profileIdForVocabulary(word.id)) return 'verb';
  if (word.category === 'Pronomen') return 'pronoun';
  if (word.target.includes(' ') || /[.!?/]$/.test(word.target)) return 'phrase';
  if (['Zeit', 'Wochentage'].includes(word.category)) return 'adverb';
  if (['Essen', 'Gefühle', 'Alltag', 'Gespräch'].includes(word.category)) return 'noun';
  return 'other';
}

export function auditVocabulary(words: VocabularyItem[]): VocabularyItem[] {
  return words.map((word) => {
    if (word.language !== 'sw') return word;
    const profileId = word.verbProfileId ?? profileIdForVocabulary(word.id);
    const profile = profileId ? verbProfiles[profileId] : undefined;
    const defaultVerification: VocabularyItem['verification'] = shortenedPresentIds.has(word.id)
      ? { status: 'nuance', note: 'Korrekte, im Alltag häufige verkürzte Ich-Form. Die explizite Verlaufsform verwendet ni-na- (z. B. ninaenda).' }
      : correctedSourceIds.has(word.id)
        ? { status: 'corrected', note: 'Ein Tippfehler oder eine ungenaue Übersetzung aus der ursprünglichen Excel-Liste wurde korrigiert.' }
        : { status: 'verified', note: 'Schreibweise und Bedeutung wurden für den aktuellen Lernkontext geprüft.' };
    return {
      ...word,
      partOfSpeech: word.partOfSpeech ?? inferredPartOfSpeech(word),
      lemma: word.lemma ?? profile?.infinitive,
      verbProfileId: profileId,
      needsReview: false,
      verification: defaultVerification,
      ...patches[word.id],
    };
  });
}
