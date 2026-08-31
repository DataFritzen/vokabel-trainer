import { profileIdForVocabulary, verbProfiles } from '@/lib/grammar-content';
import type { VocabularyItem } from '@/lib/types';

type AuditPatch = Partial<Pick<VocabularyItem, 'target' | 'translation' | 'category' | 'exampleTarget' | 'exampleTranslation' | 'partOfSpeech' | 'lemma' | 'verbProfileId' | 'notes' | 'needsReview' | 'verification' | 'learningStatus' | 'cefrLevel' | 'learningPackId' | 'responseTarget' | 'responseTranslation' | 'nounClass' | 'languageGuidance'>>;

const ugaGlossary = 'https://africa.uga.edu/Kiswahili/doe/unit_01/glossary.html';
const ugaGrammar = 'https://africa.uga.edu/Kiswahili/doe/unit_01/unit1grammar.html';
const ugaCulture = 'https://africa.uga.edu/Kiswahili/doe/unit_01/unit1culture.html';

const correctedSourceIds = new Set(['sw-003', 'sw-007', 'sw-008', 'sw-009', 'sw-010', 'sw-011', 'sw-016', 'sw-018', 'sw-019', 'sw-021', 'sw-024', 'sw-030', 'sw-046', 'sw-054']);
const shortenedPresentIds = new Set(['sw-001', 'sw-002', 'sw-003', 'sw-004', 'sw-005', 'sw-039', 'sw-041', 'sw-042', 'sw-043', 'sw-044', 'sw-051', 'sw-054']);

const patches: Record<string, AuditPatch> = {
  'sw-020': { translation: 'du (betont); dich', partOfSpeech: 'pronoun', verification: { status: 'nuance', note: 'wewe ist das selbstständige, oft betonte Pronomen. „dich/dir“ steckt im Verb normalerweise als Objektmarker -ku-.' } },
  'sw-045': { verification: { status: 'nuance', note: 'Inhaltlich gleich wie Nakupa, aber mit explizitem Präsensmarker ni-na-. Beide Formen werden geübt.' } },
  'sw-046': { verification: { status: 'corrected', note: 'Die Form mit -me- ist Perfekt: „Ich habe dich gesehen“, nicht einfach Präsens.' } },
  'sw-053': { target: 'nipo / niko / nimo', translation: 'ich bin hier / an einem Ort / darin', exampleTarget: 'Nipo hapa. / Niko Zanzibar. / Nimo ndani.', exampleTranslation: 'Ich bin hier. / Ich bin auf Sansibar. / Ich bin drinnen.', partOfSpeech: 'other', verification: { status: 'nuance', note: '-po verweist auf einen konkreten Ort, -ko auf eine allgemeinere Lage und -mo auf das Innere.' } },
  'sw-055': { partOfSpeech: 'phrase', verification: { status: 'verified', note: 'Gebräuchliche abendliche Begrüßungsfrage; jioni bezeichnet den Abend.' } },
  'sw-056': { cefrLevel: 'A1', learningPackId: 'a1-greetings', partOfSpeech: 'phrase', responseTarget: 'Nzuri, asante.', responseTranslation: 'Gut, danke.', nounClass: '9/10 (habari)', languageGuidance: { standard: 'Habari? ist eine sichere allgemeine Eröffnung oder Fortsetzung einer Begrüßung.', why: 'habari bedeutet „Neuigkeiten“. Habari gani? fragt wörtlich nach den Neuigkeiten.', commonMistake: 'Nicht nach einem einzigen Gruß sofort abbrechen: Begrüßungen bestehen häufig aus mehreren kurzen Fragen.', register: 'neutral', localUsage: 'Für Paje und Michamvi als sichere Standardform aktiv lernen; genauere lokale Varianten werden nur nach lokaler Bestätigung ergänzt.', regionalStatus: 'standard-safe', useMode: 'active', sourceLabel: 'University of Georgia – Begrüßungsformen', sourceUrl: ugaGrammar } },
  'sw-057': { cefrLevel: 'A1', learningPackId: 'a1-greetings', partOfSpeech: 'phrase', responseTarget: 'Sijambo.', responseTranslation: 'Mir geht es gut.', languageGuidance: { standard: 'Hujambo? wird einer Person gesagt; die feste Antwort ist Sijambo.', why: 'Die jambo-Formen tragen Personenmarker: hu- richtet sich an „du“, si- antwortet als „ich“.', commonMistake: 'Nicht „Hujambo“ zurücksagen, wenn du selbst antwortest – dafür heißt es Sijambo.', register: 'neutral', localUsage: 'Korrekte und sichere Standardform. Im lokalen Alltag können zusätzlich andere Begrüßungen vorkommen; diese werden getrennt gelernt.', regionalStatus: 'standard-safe', useMode: 'active', sourceLabel: 'University of Georgia – jambo-Formen', sourceUrl: ugaGrammar } },
  'sw-058': { cefrLevel: 'A1', learningPackId: 'a1-greetings', partOfSpeech: 'phrase', responseTarget: 'Marahaba.', responseTranslation: 'Respektvolle Antwort.', languageGuidance: { standard: 'Eine jüngere Person grüßt eine ältere oder ranghöhere Person mit Shikamoo; die Antwort lautet Marahaba.', why: 'Die Paarung kodiert Respekt und Rollen – sie ist kein austauschbares Hallo.', commonMistake: 'Marahaba ist die Antwort und wird nicht als Eröffnungsgruß verwendet.', register: 'respectful', localUsage: 'Für den respektvollen Umgang auf Sansibar aktiv lernen. Alter, Beziehung und Situation entscheiden über die Verwendung.', regionalStatus: 'standard-safe', useMode: 'active', sourceLabel: 'University of Georgia – Kultur der Begrüßung', sourceUrl: ugaCulture } },
  'sw-059': { cefrLevel: 'A1', learningPackId: 'a1-greetings', partOfSpeech: 'phrase', languageGuidance: { standard: 'Asante heißt danke; sana verstärkt zu „vielen Dank“.', why: 'sana bedeutet „sehr“ und verstärkt hier den Dank.', commonMistake: 'Asante sana ist bereits vollständig – ein zusätzliches tafadhali ist normalerweise nicht nötig.', register: 'polite', localUsage: 'Sichere Standardform für Paje und Michamvi.', regionalStatus: 'standard-safe', useMode: 'active', sourceLabel: 'University of Georgia – Grundwortschatz', sourceUrl: ugaGlossary } },
  'sw-060': { cefrLevel: 'A1', learningPackId: 'a1-greetings', partOfSpeech: 'phrase', languageGuidance: { standard: 'Tafadhali entspricht „bitte“ in höflichen Bitten.', why: 'Direkte Befehlsformen können mit tafadhali höflicher gemacht werden.', commonMistake: 'Nicht automatisch wie das deutsche „Bitte“ als Antwort auf Danke verwenden; dafür passt häufig karibu.', register: 'polite', localUsage: 'Sichere höfliche Standardform; die tatsächliche Position im Satz kann variieren.', regionalStatus: 'standard-safe', useMode: 'active', sourceLabel: 'University of Georgia – höfliche Aufforderungen', sourceUrl: ugaGrammar } },
  'sw-061': { cefrLevel: 'A1', learningPackId: 'a1-greetings', partOfSpeech: 'phrase', languageGuidance: { standard: 'Samahani dient als Entschuldigung oder höflicher Gesprächseinstieg.', why: 'Die Form hängt mit -samehe „verzeihen“ zusammen und signalisiert Rücksicht.', commonMistake: 'Pole ist nicht in jeder Situation gleichbedeutend: pole drückt oft Mitgefühl aus, samahani entschuldigt oder bittet um Aufmerksamkeit.', register: 'polite', localUsage: 'Sichere Standardform; regionale Feinheiten werden später mit echten Dialogen ergänzt.', regionalStatus: 'standard-safe', useMode: 'active', sourceLabel: 'University of Georgia – Grundgrammatik', sourceUrl: ugaGrammar } },
  'sw-062': { cefrLevel: 'A1', learningPackId: 'a1-greetings', partOfSpeech: 'phrase', responseTarget: 'Asante.', responseTranslation: 'Danke.', languageGuidance: { standard: 'Karibu richtet sich an eine Person, Karibuni an mehrere.', why: 'Bei der direkten Mehrzahl erhält die Aufforderung die Endung -ni.', commonMistake: 'Karibuni nicht zu einer einzelnen Person sagen, wenn nicht bewusst besonders respektvoll oder kollektiv gesprochen wird.', register: 'polite', localUsage: 'Gastfreundschaft und Willkommenheißen sind kulturell wichtig; beide Formen sind als Standard sicher.', regionalStatus: 'standard-safe', useMode: 'active', sourceLabel: 'University of Georgia – Imperative', sourceUrl: ugaGrammar } },
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
      learningStatus: word.learningStatus ?? 'active',
      verification: defaultVerification,
      ...patches[word.id],
    };
  });
}
