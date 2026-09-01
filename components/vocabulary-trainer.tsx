'use client';

import {
  ArrowRight,
  BookOpenText,
  Brain,
  CircleDashed,
  Gauge,
  Layers3,
  ListChecks,
  Shuffle,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  vocabularyReadiness,
  vocabularyReadinessCounts,
  wordMastery,
  type VerbFormFilter,
  type VocabularyTrainingMode,
  verbFormLabels,
} from '@/lib/vocabulary-training';
import type { VerbFormKey, VocabularyItem } from '@/lib/types';

export function VocabularyTrainer({
  words,
  onStart,
}: {
  words: VocabularyItem[];
  onStart: (
    mode: VocabularyTrainingMode,
    form: VerbFormFilter,
    wordId?: string,
  ) => void;
}) {
  const [selectedForm, setSelectedForm] = useState<VerbFormFilter>('weighted');
  const counts = vocabularyReadinessCounts(words);
  const deepeningWords = words.filter(
    (word) => vocabularyReadiness(word) === 'deepening',
  );
  const analyses = deepeningWords
    .map((word) => ({ word, ...wordMastery(word) }))
    .sort((a, b) => a.overall - b.overall);
  const verbs = deepeningWords.filter((word) => word.verbProfileId).length;

  return (
    <div className="mx-auto mt-7 max-w-6xl space-y-7">
      <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,#123f3a,#17665c)] text-white ring-0">
        <CardContent className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-white/60">
              Deine aktive Werkstatt
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold">
              Trainiere genau das, was schon sitzt – aber noch nicht überall.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">
              Dieser Bereich nimmt nur Wörter, deren Grundbedeutung du bereits
              kennst. Neue und unsichere Wörter bleiben im Grundlernen unter
              „Heute“.
            </p>
            <Button
              disabled={!deepeningWords.length}
              className="mt-5 rounded-xl bg-[#ffd09d] text-[#123f3a] hover:bg-[#ffe0bc]"
              onClick={() => onStart('smart', 'weighted')}
            >
              <Sparkles /> Schwachstellen optimieren
            </Button>
          </div>
          <span className="grid size-20 place-items-center rounded-3xl bg-white/10">
            <Brain className="size-10 text-[#ffd09d]" />
          </span>
        </CardContent>
      </Card>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatusCard
          icon={Layers3}
          value={words.length}
          label="aktive Wörter"
          detail="im persönlichen Lernplan"
        />
        <StatusCard
          icon={Sparkles}
          value={counts.deepening}
          label="für Vertiefung bereit"
          detail="Bedeutung sitzt bereits"
        />
        <StatusCard
          icon={BookOpenText}
          value={counts.basic}
          label="noch im Grundlernen"
          detail="zuerst Bedeutung festigen"
        />
        <StatusCard
          icon={CircleDashed}
          value={counts.unassessed}
          label="noch nicht eingestuft"
          detail="über die kurze Einstufung"
        />
      </section>

      <section
        className={
          !deepeningWords.length ? 'pointer-events-none opacity-45' : ''
        }
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Gezielt trainieren
        </p>
        <h2 className="font-heading text-2xl font-bold">Wähle deinen Modus</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <ModeCard
            icon={ListChecks}
            title="Wort & Bedeutung"
            text="Erkennen und aktiv aus dem Gedächtnis abrufen."
            onClick={() => onStart('meaning', 'weighted')}
          />
          <ModeCard
            icon={BookOpenText}
            title="Im Satz"
            text="Antworten, übersetzen und die Vokabel im Kontext einsetzen."
            onClick={() => onStart('sentences', 'weighted')}
          />
          <Card className="border-0 bg-card ring-border/70">
            <CardHeader>
              <span className="grid size-11 place-items-center rounded-xl bg-primary/8">
                <Gauge className="size-5 text-primary" />
              </span>
              <CardTitle className="font-heading text-xl">
                Formen & Zeiten
              </CardTitle>
              <CardDescription>
                {verbs} bekannte Verben mit eigener Formenbewertung.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <select
                aria-label="Zeitform auswählen"
                className="h-10 w-full rounded-xl border bg-background px-3 text-sm"
                value={selectedForm}
                onChange={(event) =>
                  setSelectedForm(event.target.value as VerbFormFilter)
                }
              >
                <option value="weighted">Relevant gewichtet</option>
                {(Object.keys(verbFormLabels) as VerbFormKey[]).map((key) => (
                  <option key={key} value={key}>
                    {verbFormLabels[key]}
                  </option>
                ))}
              </select>
              <Button
                className="mt-3 w-full rounded-xl"
                onClick={() => onStart('forms', selectedForm)}
              >
                Formtraining starten
              </Button>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Präsens und Vergangenheit erscheinen im gewichteten Modus am
                häufigsten.
              </p>
            </CardContent>
          </Card>
        </div>
        <Button
          variant="outline"
          className="mt-4 rounded-xl"
          onClick={() => onStart('mix', 'weighted')}
        >
          <Shuffle /> Adaptiver Mix aus allen Bereichen
        </Button>
        {!deepeningWords.length && (
          <p className="mt-3 text-sm text-muted-foreground">
            Noch kein Wort ist für die Vertiefung freigegeben. Starte auf
            „Heute“ die Einstufung oder das Grundlernen.
          </p>
        )}
      </section>

      {analyses.length > 0 && (
        <section>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Wortanalyse
              </p>
              <h2 className="font-heading text-2xl font-bold">
                Deine größten Hebel
              </h2>
            </div>
            <span className="text-xs text-muted-foreground">
              ohne Hören & Aussprache
            </span>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {analyses
              .slice(0, 8)
              .map(({ word, meaning, forms, sentences, overall }) => (
                <Card key={word.id} className="border-0 bg-card ring-border/70">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/8 font-heading font-bold text-primary">
                        {word.target[0]}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <strong className="block truncate">
                              {word.target}
                            </strong>
                            <span className="block truncate text-xs text-muted-foreground">
                              {word.translation}
                            </span>
                          </div>
                          <strong className="font-heading text-xl text-primary">
                            {overall}%
                          </strong>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
                          <MiniScore label="Bedeutung" value={meaning} />
                          <MiniScore label="Formen" value={forms} />
                          <MiniScore label="Im Satz" value={sentences} />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-2 w-full rounded-lg"
                          onClick={() => onStart('smart', 'weighted', word.id)}
                        >
                          Dieses Wort optimieren <ArrowRight />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ModeCard({
  icon: Icon,
  title,
  text,
  onClick,
}: {
  icon: typeof ListChecks;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <span className="grid size-11 place-items-center rounded-xl bg-primary/8">
        <Icon className="size-5 text-primary" />
      </span>
      <strong className="mt-4 block font-heading text-xl">{title}</strong>
      <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
        {text}
      </span>
      <span className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
        Starten <ArrowRight className="size-3" />
      </span>
    </button>
  );
}
function StatusCard({
  icon: Icon,
  value,
  label,
  detail,
}: {
  icon: typeof Layers3;
  value: number;
  label: string;
  detail: string;
}) {
  return (
    <Card className="border-0 bg-card ring-border/70">
      <CardContent className="flex items-center gap-4 p-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/8">
          <Icon className="size-5 text-primary" />
        </span>
        <span>
          <strong className="block font-heading text-2xl text-primary">
            {value}
          </strong>
          <span className="block text-sm font-semibold">{label}</span>
          <span className="block text-[11px] text-muted-foreground">
            {detail}
          </span>
        </span>
      </CardContent>
    </Card>
  );
}
function MiniScore({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-lg bg-muted p-2">
      <div className="mb-1 flex justify-between">
        <span>{label}</span>
        <strong>{value === null ? '–' : `${value}%`}</strong>
      </div>
      <Progress value={value ?? 0} />
    </div>
  );
}
