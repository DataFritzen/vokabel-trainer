'use client';

import {
  ArrowRight,
  BookOpenCheck,
  Brain,
  Check,
  Layers3,
  Map,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { learningPacks } from '@/lib/curriculum';
import { wordMastery } from '@/lib/vocabulary-training';
import type { VocabularyItem } from '@/lib/types';

export function LearningPath({
  words,
  startedPackIds,
  onStart,
  onWord,
}: {
  words: VocabularyItem[];
  startedPackIds: string[];
  onStart: (packId: string) => void;
  onWord: (word: VocabularyItem) => void;
}) {
  return (
    <div className="mx-auto mt-7 max-w-6xl space-y-6">
      <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,#123f3a,#17665c)] text-white ring-0">
        <CardContent className="grid gap-5 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-white/60">
              A1 → A2 → B1
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold">
              Dein Lernpfad in echten Gesprächszielen
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">
              Deine 55 bisherigen aktiven Einträge sind jetzt pädagogisch
              geordnet: 42 Kernbausteine in sechs Siebener-Einheiten plus 13
              klar zugeordnete Hilfen und Satzvarianten. Neue Inhalte werden
              erst beim Start aktiv.
            </p>
          </div>
          <span className="grid size-16 place-items-center rounded-2xl bg-white/10">
            <Map className="size-8 text-[#ffd09d]" />
          </span>
        </CardContent>
      </Card>

      <Card className="border-0 bg-card ring-border/70">
        <CardContent className="grid gap-3 p-5 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="flex gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/8">
              <Brain className="size-5 text-primary" />
            </span>
            <div>
              <strong className="block">
                Lernpfad = Inhalt und Reihenfolge
              </strong>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Hier lernst du die sieben Bedeutungen und Gesprächsbausteine
                einer Situation.
              </p>
            </div>
          </div>
          <ArrowRight className="hidden size-5 text-muted-foreground md:block" />
          <div className="flex gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fff0d5]">
              <BookOpenCheck className="size-5 text-[#8f671f]" />
            </span>
            <div>
              <strong className="block">Grammatik = Formen und Satzbau</strong>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Passende Übungen hängen an denselben Wörtern, haben aber einen
                eigenen Lernstand und Terminplan.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {learningPacks.map((pack) => {
        const packWords = pack.vocabularyIds
          .map((id) => words.find((word) => word.id === id))
          .filter((word): word is VocabularyItem => Boolean(word));
        const supportWords = (pack.supportingVocabularyIds ?? [])
          .map((id) => words.find((word) => word.id === id))
          .filter((word): word is VocabularyItem => Boolean(word));
        const started =
          pack.activation === 'already-active' ||
          startedPackIds.includes(pack.id);
        const practiced = packWords.filter((word) => word.card.reps > 0).length;
        const average = packWords.length
          ? Math.round(
              packWords.reduce(
                (sum, word) => sum + wordMastery(word).overall,
                0,
              ) / packWords.length,
            )
          : 0;
        return (
          <Card
            key={pack.id}
            className="overflow-hidden border-0 bg-card ring-border/70"
          >
            <div className="grid lg:grid-cols-[.72fr_1.28fr]">
              <CardHeader className="bg-[#fbf2db] p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#123f3a] px-3 py-1 text-xs font-bold text-white">
                    {pack.level} · Lerneinheit {pack.order}
                  </span>
                  <span className="text-xs font-semibold text-[#8f671f]">
                    {started ? `${average}% Kompetenz` : 'noch nicht begonnen'}
                  </span>
                </div>
                <CardTitle className="mt-4 font-heading text-3xl">
                  {pack.title}
                </CardTitle>
                <CardDescription className="leading-relaxed">
                  {pack.goal}
                </CardDescription>
                <div className="mt-3">
                  <div className="mb-2 flex justify-between text-xs text-[#756747]">
                    <span>{practiced}/7 Kernbausteine trainiert</span>
                    <span>
                      {pack.activation === 'already-active'
                        ? 'aus deiner Excel-Liste'
                        : started
                          ? 'aktiv'
                          : 'Vorschau'}
                    </span>
                  </div>
                  <Progress value={(practiced / 7) * 100} />
                </div>
                <Button
                  className="mt-4 rounded-xl"
                  onClick={() => onStart(pack.id)}
                >
                  {started ? 'Lerneinheit üben' : 'Lerneinheit beginnen'}{' '}
                  <ArrowRight />
                </Button>
              </CardHeader>
              <CardContent className="p-6 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
                  Die sieben Kernbausteine
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {packWords.map((word, index) => (
                    <button
                      key={word.id}
                      onClick={() => onWord(word)}
                      className="flex items-center gap-3 rounded-xl border p-3 text-left transition hover:border-primary/30"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/8 text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block truncate text-sm">
                          {word.target}
                        </strong>
                        <span className="block truncate text-xs text-muted-foreground">
                          {word.translation}
                        </span>
                      </span>
                      {started && word.card.reps > 0 && (
                        <Check className="size-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
                {supportWords.length > 0 && (
                  <details className="mt-4 rounded-xl bg-muted p-3">
                    <summary className="cursor-pointer text-xs font-semibold text-primary">
                      <span className="inline-flex items-center gap-2">
                        <Layers3 className="size-4" /> {supportWords.length}{' '}
                        zugeordnete Hilfen & Varianten
                      </span>
                    </summary>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {supportWords.map((word) => (
                        <button
                          key={word.id}
                          onClick={() => onWord(word)}
                          className="rounded-lg bg-card px-3 py-2 text-left text-xs"
                        >
                          <strong className="block">{word.target}</strong>
                          <span className="text-muted-foreground">
                            {word.curriculum?.role === 'enrichment'
                              ? 'später'
                              : word.curriculum?.role === 'helper'
                                ? 'Hilfswort'
                                : word.curriculum?.role === 'sentence-model'
                                  ? 'Satzmuster'
                                  : 'Grammatikvariante'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </details>
                )}
              </CardContent>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
