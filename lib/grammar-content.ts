import { newCard } from '@/lib/scheduler';
import type { GrammarExercise, GrammarLesson, VocabularyItem } from '@/lib/types';

export const grammarLessons: GrammarLesson[] = [
  { id: 'salamu', level: 'A1', title: 'Begrüßung als Gespräch', summary: 'Swahili-Begrüßungen bestehen häufig aus Frage und passender Antwort; Alter und Anzahl beeinflussen die Form.', formula: 'Gruß + passende Antwort + mögliche Anschlussfrage', example: 'Hujambo? — Sijambo. · Shikamoo. — Marahaba.' },
  { id: 'verbaufbau', level: 'A1', title: 'Der Swahili-Verbzug', summary: 'Ein einziges Verb trägt Subjekt, Zeit und manchmal sogar das Objekt.', formula: 'Subjekt + Zeit + Objekt + Stamm + Endung', example: 'ni-na-ku-on-a → ich sehe dich' },
  { id: 'praesens', level: 'A1', title: 'Präsens mit -na-', summary: 'Die Person steht vor dem Zeitmarker -na-. In der 1. Person hört man daneben häufig eine kürzere allgemeine Form.', formula: 'ni/u/a/tu/m/wa + na + Stamm + a', example: 'Ninakula. · Unakula. · Tunakula.' },
  { id: 'negation', level: 'A1', title: 'Präsens verneinen', summary: 'Der positive Subjektmarker wird negativ, -na- fällt weg und bei regulären Verben wird -a zu -i.', formula: 'si/hu/ha/hatu/ham/hawa + Stamm + i', example: 'Ninapenda chai. → Sipendi chai.' },
  { id: 'objektmarker', level: 'A1', title: '„dich“ im Verb: -ku-', summary: 'Der Objektmarker steht zwischen Zeitmarker und Verbstamm.', formula: 'Subjekt + Zeit + ku + Stamm + Endung', example: 'Ni-na-ku-saidia. → Ich helfe dir.' },
  { id: 'infinitiv', level: 'A1', title: 'Zwei Verben verbinden', summary: 'Nach wollen, gehen oder anfangen folgt häufig der Infinitiv mit ku-.', formula: 'konjugiertes Verb + ku + Stamm + a', example: 'Nataka kula. · Ninaenda kununua mkate.' },
  { id: 'zeiten', level: 'A2', title: 'Vergangenheit, Perfekt, Zukunft', summary: '-li- erzählt Vergangenes, -me- betont ein Ergebnis und -ta- bildet die Zukunft.', formula: 'Subjekt + li/me/ta + Stamm + a', example: 'Nilipika. · Nimepika. · Nitapika.' },
  { id: 'ort', level: 'A2', title: 'Nipo, niko und nimo', summary: 'Die drei Ortskopeln unterscheiden einen konkreten Ort, eine allgemeine Lage und das Innere.', formula: 'ni + po/ko/mo', example: 'Nipo hapa. · Niko Zanzibar. · Nimo ndani.' },
];

type VerbProfile = {
  infinitive: string; stem: string; meaning: string; you: string; we: string; negativeI: string; firstPresent: string; objectPerspective?: boolean;
};

export const verbProfiles: Record<string, VerbProfile> = {
  enda: { infinitive: 'kwenda', stem: '-enda', meaning: 'gehen', firstPresent: 'ninaenda', you: 'unaenda', we: 'tunaenda', negativeI: 'siendi' },
  penda: { infinitive: 'kupenda', stem: '-penda', meaning: 'mögen', firstPresent: 'ninapenda', you: 'unapenda', we: 'tunapenda', negativeI: 'sipendi' },
  taka: { infinitive: 'kutaka', stem: '-taka', meaning: 'wollen', firstPresent: 'ninataka', you: 'unataka', we: 'tunataka', negativeI: 'sitaki' },
  kuja: { infinitive: 'kuja', stem: '-ja', meaning: 'kommen', firstPresent: 'ninakuja', you: 'unakuja', we: 'tunakuja', negativeI: 'siji' },
  kula: { infinitive: 'kula', stem: '-la', meaning: 'essen', firstPresent: 'ninakula', you: 'unakula', we: 'tunakula', negativeI: 'sili' },
  onana: { infinitive: 'kuonana', stem: '-onana', meaning: 'einander sehen', firstPresent: 'ninaonana', you: 'unaonana', we: 'tunaonana', negativeI: 'sionani' },
  nunua: { infinitive: 'kununua', stem: '-nunua', meaning: 'kaufen', firstPresent: 'ninanunua', you: 'unanunua', we: 'tunanunua', negativeI: 'sinunui' },
  pika: { infinitive: 'kupika', stem: '-pika', meaning: 'kochen', firstPresent: 'ninapika', you: 'unapika', we: 'tunapika', negativeI: 'sipiki' },
  omba: { infinitive: 'kuomba', stem: '-omba', meaning: 'bitten', firstPresent: 'ninaomba', you: 'unaomba', we: 'tunaomba', negativeI: 'siombi' },
  shukuru: { infinitive: 'kushukuru', stem: '-shukuru', meaning: 'danken', firstPresent: 'ninakushukuru', you: 'unanishukuru', we: 'tunakushukuru', negativeI: 'sikushukuru', objectPerspective: true },
  pa: { infinitive: 'kupa', stem: '-pa', meaning: 'geben', firstPresent: 'ninakupa', you: 'unanipa', we: 'tunakupa', negativeI: 'sikupi', objectPerspective: true },
  subiri: { infinitive: 'kusubiri', stem: '-subiri', meaning: 'warten', firstPresent: 'ninakusubiri', you: 'unanisubiri', we: 'tunakusubiri', negativeI: 'sikusubiri', objectPerspective: true },
  saidia: { infinitive: 'kusaidia', stem: '-saidia', meaning: 'helfen', firstPresent: 'ninakusaidia', you: 'unanisaidia', we: 'tunakusaidia', negativeI: 'sikusaidii', objectPerspective: true },
  pigia: { infinitive: 'kupigia simu', stem: '-pigia', meaning: 'anrufen', firstPresent: 'ninakupigia simu', you: 'unanipigia simu', we: 'tunakupigia simu', negativeI: 'sikupigii simu', objectPerspective: true },
  ona: { infinitive: 'kuona', stem: '-ona', meaning: 'sehen', firstPresent: 'ninakuona', you: 'unaniona', we: 'tunakuona', negativeI: 'sikuoni', objectPerspective: true },
  rudi: { infinitive: 'kurudi', stem: '-rudi', meaning: 'zurückkehren', firstPresent: 'ninarudi', you: 'unarudi', we: 'tunarudi', negativeI: 'sirudi' },
};

const vocabularyProfiles: Record<string, string> = {
  'sw-001': 'enda', 'sw-002': 'penda', 'sw-003': 'taka', 'sw-004': 'kuja', 'sw-005': 'kula', 'sw-006': 'onana',
  'sw-021': 'enda', 'sw-022': 'nunua', 'sw-023': 'nunua', 'sw-024': 'nunua', 'sw-026': 'kula', 'sw-028': 'pika',
  'sw-030': 'enda', 'sw-031': 'omba', 'sw-039': 'kuja', 'sw-040': 'shukuru', 'sw-041': 'pa', 'sw-042': 'subiri',
  'sw-043': 'saidia', 'sw-044': 'pigia', 'sw-045': 'pa', 'sw-046': 'ona', 'sw-051': 'ona', 'sw-054': 'rudi',
};

export function profileIdForVocabulary(id: string) { return vocabularyProfiles[id]; }

export function grammarExercisesForVocabulary(word: VocabularyItem, now = new Date()): GrammarExercise[] {
  const profileId = word.verbProfileId ?? vocabularyProfiles[word.id];
  const custom = word.grammarForms;
  const customComplete = custom && [custom.infinitive, custom.stem, custom.meaning, custom.firstPresent, custom.you, custom.we, custom.negativeI].every((value) => value.trim());
  const profile = customComplete ? custom : (profileId ? verbProfiles[profileId] : undefined);
  if (!profile) return [];
  const base = `word-${word.id}`;
  const sentenceTarget = word.exampleTarget || (/[.!?]$/.test(word.target.trim()) ? word.target : undefined);
  const sentenceTranslation = word.exampleTranslation || (sentenceTarget ? word.translation : undefined);
  return [
    { id: `${base}-you`, lessonId: 'praesens', vocabularyId: word.id, kind: 'transform', title: `Du-Form von ${profile.infinitive}`, prompt: profile.objectPerspective ? `Bilde die Du-Form von ${profile.infinitive}; aus „dich/dir“ wird dabei „mich/mir“.` : `Bilde die Präsensform für „du“ von ${profile.infinitive} (${profile.meaning}).`, answer: `${profile.you}.`, alternatives: [profile.you], hint: profile.objectPerspective ? `u + na + ni + ${profile.stem.replace('-', '')}` : `u + na + ${profile.stem.replace('-', '')}`, explanation: profile.objectPerspective ? `${profile.you}: u- ist „du“, -na- das Präsens und -ni- steht für „mich/mir“.` : `${profile.you} besteht aus dem Subjektmarker u-, dem Präsensmarker -na- und dem Stamm ${profile.stem}.`, card: newCard(now) },
    { id: `${base}-we`, lessonId: 'praesens', vocabularyId: word.id, kind: 'transform', title: `Wir-Form von ${profile.infinitive}`, prompt: `Bilde die Präsensform für „wir“ von ${profile.infinitive} (${profile.meaning}).`, answer: `${profile.we}.`, alternatives: [profile.we], hint: `tu + na + ${profile.stem.replace('-', '')}`, explanation: `Für „wir“ beginnt das Verb mit tu-.`, card: newCard(now) },
    { id: `${base}-negative`, lessonId: 'negation', vocabularyId: word.id, kind: 'negative', title: 'Verneinung', prompt: `Bilde die negative Ich-Form von ${profile.infinitive} (${profile.meaning}).`, answer: `${profile.negativeI}.`, alternatives: [profile.negativeI], hint: 'Bei der Verneinung fällt -na- weg.', explanation: `Die richtige negative Ich-Form lautet ${profile.negativeI}. Unregelmäßige kurze Verben können dabei ihre Form verändern.`, card: newCard(now) },
    { id: `${base}-lemma`, lessonId: 'verbaufbau', vocabularyId: word.id, kind: 'analyze', title: 'Grundform erkennen', prompt: `Wie lautet der Infinitiv zu „${word.target}“?`, answer: profile.infinitive, alternatives: [profile.stem.replace('-', '')], hint: `Die Grundform beginnt meist mit ku-.`, explanation: `${profile.infinitive} ist der Infinitiv; der Stamm ist ${profile.stem}.`, card: newCard(now) },
    ...(sentenceTarget && sentenceTranslation ? [{ id: `${base}-sentence`, lessonId: 'verbaufbau', vocabularyId: word.id, kind: 'sentence' as const, title: 'Satz aktiv bilden', prompt: `Übersetze: „${sentenceTranslation}“`, answer: sentenceTarget, hint: `Nutze ${profile.infinitive}.`, explanation: `Modelllösung: ${sentenceTarget}`, card: newCard(now) }] : []),
  ];
}

export function createGrammarExercises(words: VocabularyItem[], now = new Date()): GrammarExercise[] {
  const wordExercises = words.flatMap((word) => grammarExercisesForVocabulary(word, now));
  const greetingExercises: GrammarExercise[] = [
    { id: 'pack-a1-greetings-habari', lessonId: 'salamu', vocabularyId: 'sw-056', kind: 'sentence', title: 'Auf Habari antworten', prompt: 'Antworte höflich auf: „Habari?“', answer: 'Nzuri, asante.', alternatives: ['nzuri', 'salama', 'salama, asante'], hint: 'Gut + danke', explanation: 'Habari fragt nach Neuigkeiten oder dem Befinden. Nzuri, asante ist eine sichere kurze Antwort.', card: newCard(now) },
    { id: 'pack-a1-greetings-jambo', lessonId: 'salamu', vocabularyId: 'sw-057', kind: 'transform', title: 'Die passende Ich-Antwort', prompt: 'Wie antwortest du auf „Hujambo?“', answer: 'Sijambo.', alternatives: ['sijambo'], hint: 'Die Antwort beginnt mit si-.', explanation: 'hu- richtet die jambo-Form an „du“; si- antwortet für „ich“.', card: newCard(now) },
    { id: 'pack-a1-greetings-shikamoo', lessonId: 'salamu', vocabularyId: 'sw-058', kind: 'sentence', title: 'Respektvoll antworten', prompt: 'Eine jüngere Person sagt „Shikamoo“. Wie antwortet die ältere Person?', answer: 'Marahaba.', alternatives: ['marahaba'], hint: 'Diese Antwort gehört fest zu Shikamoo.', explanation: 'Shikamoo und Marahaba bilden ein kulturell festes Paar.', card: newCard(now) },
    { id: 'pack-a1-greetings-asante', lessonId: 'salamu', vocabularyId: 'sw-059', kind: 'build', title: 'Dank verstärken', prompt: 'Bilde: „Vielen Dank.“', answer: 'Asante sana.', alternatives: ['asante sana'], hint: 'sana = sehr', explanation: 'Asante heißt danke; sana verstärkt den Dank.', card: newCard(now) },
    { id: 'pack-a1-greetings-tafadhali', lessonId: 'salamu', vocabularyId: 'sw-060', kind: 'sentence', title: 'Höflich bestellen', prompt: 'Bilde: „Wasser, bitte.“', answer: 'Maji, tafadhali.', alternatives: ['maji tafadhali'], hint: 'Bitte steht hier nach dem Wunsch.', explanation: 'Tafadhali macht die Bitte höflich.', card: newCard(now) },
    { id: 'pack-a1-greetings-samahani', lessonId: 'salamu', vocabularyId: 'sw-061', kind: 'build', title: 'Höflich ansprechen', prompt: 'Welches Wort eröffnet höflich eine Entschuldigung oder Frage?', answer: 'Samahani.', alternatives: ['samahani'], hint: 'Nicht pole: Gesucht ist „Entschuldigung“.', explanation: 'Samahani entschuldigt oder bittet höflich um Aufmerksamkeit; pole drückt oft Mitgefühl aus.', card: newCard(now) },
    { id: 'pack-a1-greetings-karibuni', lessonId: 'salamu', vocabularyId: 'sw-062', kind: 'transform', title: 'Eine oder mehrere Personen', prompt: 'Setze „Karibu!“ in die Form für mehrere Personen.', answer: 'Karibuni!', alternatives: ['karibuni'], hint: 'Füge die Mehrzahlendung -ni an.', explanation: 'Karibu gilt für eine Person, Karibuni für mehrere.', card: newCard(now) },
  ];
  const general: GrammarExercise[] = [
    { id: 'general-verbzug', lessonId: 'verbaufbau', kind: 'analyze', title: 'Verb zerlegen', prompt: 'Zerlege „ninakuona“ mit Bindestrichen.', answer: 'ni-na-ku-on-a', alternatives: ['ni-na-ku-ona'], hint: 'ich + Präsens + dich + sehen + Endung', explanation: 'ni- = ich, -na- = Präsens, -ku- = dich, -on- = sehen, -a = Endvokal.', card: newCard(now) },
    { id: 'general-present', lessonId: 'praesens', kind: 'build', title: 'Präsens bilden', prompt: 'Bilde: „Wir essen Reis.“', answer: 'Tunakula wali.', alternatives: ['tunakula wali'], hint: 'tu + na + kula', explanation: 'tu- markiert „wir“, -na- das Präsens.', card: newCard(now) },
    { id: 'general-negative', lessonId: 'negation', kind: 'negative', title: 'Satz verneinen', prompt: 'Verneine: „Ninapenda chai.“', answer: 'Sipendi chai.', alternatives: ['sipendi chai'], hint: 'si- + pend + -i', explanation: 'Im negativen Präsens fallen -ni- und -na- weg; die Endung wird -i.', card: newCard(now) },
    { id: 'general-object', lessonId: 'objektmarker', kind: 'build', title: 'Objektmarker einsetzen', prompt: 'Bilde: „Ich helfe dir.“', answer: 'Ninakusaidia.', alternatives: ['nakusaidia'], hint: 'ni + na + ku + saidia', explanation: '-ku- steht für „dich/dir“ und sitzt vor dem Verbstamm.', card: newCard(now) },
    { id: 'general-infinitive', lessonId: 'infinitiv', kind: 'sentence', title: 'Zwei Verben verbinden', prompt: 'Bilde: „Ich möchte essen.“', answer: 'Nataka kula.', alternatives: ['ninataka kula'], hint: 'Das zweite Verb bleibt im Infinitiv.', explanation: 'Nach nataka folgt kula mit seinem Infinitivbestandteil ku-.', card: newCard(now) },
    { id: 'general-tenses', lessonId: 'zeiten', kind: 'transform', title: 'In die Zukunft setzen', prompt: 'Setze „Ninapika.“ in die Zukunft.', answer: 'Nitapika.', alternatives: ['nitapika'], hint: 'Ersetze -na- durch -ta-.', explanation: '-ta- ist der Zukunftsmarker.', card: newCard(now) },
    { id: 'general-place', lessonId: 'ort', kind: 'build', title: 'Ort ausdrücken', prompt: 'Bilde: „Ich bin hier.“', answer: 'Nipo hapa.', alternatives: ['niko hapa'], hint: 'Für einen konkreten Ort: -po.', explanation: 'Nipo hapa bezeichnet einen konkreten Ort. Niko hapa wird ebenfalls verwendet, ist aber weniger spezifisch.', card: newCard(now) },
  ];
  return [...general, ...greetingExercises, ...wordExercises];
}
