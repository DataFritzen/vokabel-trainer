'use client';

import { ArrowRight, BookOpenCheck, Dumbbell, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { grammarLessons } from '@/lib/grammar-content';
import { isDue } from '@/lib/scheduler';
import type { GrammarExercise, VocabularyItem } from '@/lib/types';

export function GrammarHub({ exercises, words, onStart, onWord }: { exercises: GrammarExercise[]; words: VocabularyItem[]; onStart: (items: GrammarExercise[]) => void; onWord: (word: VocabularyItem) => void }) {
  const general = exercises.filter((exercise) => !exercise.vocabularyId);
  const due = exercises.filter((exercise) => isDue(exercise.card));
  const verbWords = words.filter((word) => exercises.some((exercise) => exercise.vocabularyId === word.id));
  const practiced = exercises.filter((exercise) => exercise.card.reps > 0).length;
  const dailySet = [...due, ...exercises.filter((exercise) => exercise.card.reps === 0)].filter((exercise, index, all) => all.findIndex((item) => item.id === exercise.id) === index).slice(0, 7);

  return <div className="mx-auto mt-7 max-w-6xl">
    <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,#123f3a,#17665c)] text-white ring-0"><CardContent className="grid gap-5 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-white/60">Dein zweiter Lernstrom</p><h2 className="mt-2 font-heading text-3xl font-bold">Formen verstehen, Sätze selbst bauen.</h2><p className="mt-3 max-w-2xl text-sm text-white/70">Vokabeln und Grammatik werden getrennt geplant. So trainierst du genau die Form, die noch unsicher ist.</p></div><Button className="rounded-xl bg-[#f4c97f] text-[#123f3a] hover:bg-[#ffdb9d]" onClick={() => onStart(dailySet.length ? dailySet : general)}><Dumbbell /> 7 Übungen starten</Button></CardContent></Card>
    <div className="mt-5 grid gap-4 sm:grid-cols-3"><Metric value={exercises.length} label="aktive Übungen" /><Metric value={practiced} label="schon trainiert" /><Metric value={due.length} label="jetzt fällig" /></div>
    <div className="mt-8 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Allgemeine Grammatik</p><h2 className="font-heading text-2xl font-bold">Dein Swahili-Baukasten</h2></div><Button variant="outline" className="rounded-xl" onClick={() => onStart(general)}>Alles üben <ArrowRight /></Button></div>
    <div className="mt-4 grid gap-4 md:grid-cols-2">{grammarLessons.map((lesson) => { const lessonExercises = exercises.filter((exercise) => exercise.lessonId === lesson.id && !exercise.vocabularyId); return <Card key={lesson.id} className="border-0 bg-card ring-border/70"><CardHeader><div className="flex items-center justify-between"><span className="rounded-full bg-primary/8 px-2 py-1 text-[10px] font-bold text-primary">{lesson.level}</span><BookOpenCheck className="size-5 text-primary" /></div><CardTitle className="font-heading text-xl">{lesson.title}</CardTitle><CardDescription>{lesson.summary}</CardDescription></CardHeader><CardContent><div className="rounded-xl bg-muted p-3"><code className="text-xs font-semibold text-primary">{lesson.formula}</code><p className="mt-2 text-sm">{lesson.example}</p></div><Button disabled={!lessonExercises.length} variant="ghost" className="mt-3 w-full rounded-xl" onClick={() => onStart(lessonExercises)}>Diese Regel üben</Button></CardContent></Card>; })}</div>
    <div className="mt-9"><p className="text-xs font-semibold uppercase tracking-wider text-primary">Mit deinen Wörtern</p><h2 className="font-heading text-2xl font-bold">Verbtraining pro Vokabel</h2><p className="mt-1 text-sm text-muted-foreground">Öffne ein Wort für Formen, Verneinung und seinen Beispielsatz.</p></div>
    <div className="mt-4 grid gap-3 md:grid-cols-2">{verbWords.map((word) => <button key={word.id} onClick={() => onWord(word)} className="flex items-center gap-3 rounded-2xl border bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30"><span className="grid size-10 place-items-center rounded-xl bg-primary/8 font-heading font-bold text-primary">{word.target[0]}</span><span className="flex-1"><strong className="block">{word.target}</strong><span className="text-sm text-muted-foreground">{word.lemma} · {exercises.filter((exercise) => exercise.vocabularyId === word.id).length} Übungen</span></span><ArrowRight className="size-4 text-muted-foreground" /></button>)}</div>
  </div>;
}

function Metric({ value, label }: { value: number; label: string }) { return <Card className="border-0 bg-card ring-border/70"><CardContent className="flex items-center gap-3 p-5"><span className="grid size-11 place-items-center rounded-xl bg-primary/8"><ShieldCheck className="size-5 text-primary" /></span><span><strong className="block font-heading text-2xl text-primary">{value}</strong><span className="text-xs text-muted-foreground">{label}</span></span></CardContent></Card>; }
