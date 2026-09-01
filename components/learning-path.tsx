'use client';

import { ArrowRight, Check, LockKeyhole, Map, MessageCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { learningPacks } from '@/lib/curriculum';
import { wordMastery } from '@/lib/vocabulary-training';
import type { VocabularyItem } from '@/lib/types';

export function LearningPath({ words, startedPackIds, onStart, onWord }: { words: VocabularyItem[]; startedPackIds: string[]; onStart: (packId: string) => void; onWord: (word: VocabularyItem) => void }) {
  return <div className="mx-auto mt-7 max-w-6xl space-y-6">
    <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,#123f3a,#17665c)] text-white ring-0"><CardContent className="grid gap-5 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-white/60">A1 → A2 → B1</p><h2 className="mt-2 font-heading text-3xl font-bold">Dein Lernpfad in echten Gesprächszielen</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">Eine Lerneinheit führt sieben neue Kernwörter oder Gesprächsbausteine ein. Erst beim Start werden sie Teil deines aktiven Wortschatzes.</p></div><span className="grid size-16 place-items-center rounded-2xl bg-white/10"><Map className="size-8 text-[#ffd09d]" /></span></CardContent></Card>

    {learningPacks.map((pack) => {
      const packWords = pack.vocabularyIds.map((id) => words.find((word) => word.id === id)).filter((word): word is VocabularyItem => Boolean(word));
      const started = startedPackIds.includes(pack.id);
      const practiced = packWords.filter((word) => word.card.reps > 0).length;
      const average = packWords.length ? Math.round(packWords.reduce((sum, word) => sum + wordMastery(word).overall, 0) / packWords.length) : 0;
      return <Card key={pack.id} className="overflow-hidden border-0 bg-card ring-border/70"><div className="grid lg:grid-cols-[.72fr_1.28fr]"><CardHeader className="bg-[#fbf2db] p-6 sm:p-7"><div className="flex items-center justify-between"><span className="rounded-full bg-[#123f3a] px-3 py-1 text-xs font-bold text-white">{pack.level} · Lerneinheit {pack.order}</span><span className="text-xs font-semibold text-[#8f671f]">{started ? `${average}% Kompetenz` : 'noch nicht begonnen'}</span></div><CardTitle className="mt-4 font-heading text-3xl">{pack.title}</CardTitle><CardDescription className="leading-relaxed">{pack.goal}</CardDescription><div className="mt-3"><div className="mb-2 flex justify-between text-xs text-[#756747]"><span>{practiced}/7 Wörter trainiert</span><span>{started ? 'aktiv' : 'Vorschau'}</span></div><Progress value={practiced / 7 * 100} /></div><Button className="mt-4 rounded-xl" onClick={() => onStart(pack.id)}>{started ? 'Lerneinheit weiterüben' : 'Lerneinheit beginnen'} <ArrowRight /></Button></CardHeader><CardContent className="p-6 sm:p-7"><p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">Die sieben Kernbausteine</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{packWords.map((word, index) => <button key={word.id} onClick={() => onWord(word)} className="flex items-center gap-3 rounded-xl border p-3 text-left transition hover:border-primary/30"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/8 text-xs font-bold text-primary">{index + 1}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{word.target}</strong><span className="block truncate text-xs text-muted-foreground">{word.translation}</span></span>{started && word.card.reps > 0 && <Check className="size-4 text-primary" />}</button>)}</div></CardContent></div></Card>;
    })}

    <section><p className="text-xs font-semibold uppercase tracking-wider text-primary">Danach</p><h2 className="font-heading text-2xl font-bold">Der weitere A1-Weg</h2><div className="mt-4 grid gap-3 md:grid-cols-3"><FutureUnit title="Sich vorstellen" detail="Name, Herkunft, Wohnort und einfache Rückfragen" /><FutureUnit title="Unterwegs im Ort" detail="Richtung, Transport, Markt und Treffpunkte" /><FutureUnit title="Essen & bestellen" detail="Wünsche, Mengen, Preise und höfliche Rückfragen" /></div></section>
  </div>;
}

function FutureUnit({ title, detail }: { title: string; detail: string }) { return <Card className="border-dashed bg-card/60"><CardContent className="p-5"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-muted"><MessageCircle className="size-5 text-muted-foreground" /></span><LockKeyhole className="size-4 text-muted-foreground" /></div><strong className="mt-4 block">{title}</strong><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</p><span className="mt-3 inline-block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">In Vorbereitung</span></CardContent></Card>; }
