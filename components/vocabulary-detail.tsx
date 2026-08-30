'use client';

import { BookOpenCheck, CheckCircle2, Lightbulb, Pencil, ShieldCheck, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { GrammarExercise, VocabularyItem } from '@/lib/types';

const statusLabel = { verified: 'Geprüft', corrected: 'Korrigiert', nuance: 'Mit Hinweis' } as const;

export function VocabularyDetail({ word, exercises, onClose, onEdit, onPractice }: { word: VocabularyItem; exercises: GrammarExercise[]; onClose: () => void; onEdit: () => void; onPractice: (items: GrammarExercise[]) => void }) {
  const grammar = exercises.filter((exercise) => exercise.kind !== 'sentence');
  const sentences = exercises.filter((exercise) => exercise.kind === 'sentence');
  return <dialog open className="fixed inset-0 z-50 m-0 grid h-full max-h-none w-full max-w-none place-items-center border-0 bg-[#082b28]/60 p-3 backdrop-blur-sm"><div className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-card text-foreground shadow-2xl">
    <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-card/95 p-4 backdrop-blur"><div><p className="text-xs text-muted-foreground">{word.category}</p><h2 className="font-heading text-3xl font-bold text-primary">{word.target}</h2><p className="text-sm text-muted-foreground">{word.translation}</p></div><Button size="icon" variant="ghost" onClick={onClose}><X /></Button></header>
    <div className="space-y-5 p-5">
      {word.verification && <div className="flex gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" /><div><strong className="text-sm">{statusLabel[word.verification.status]}</strong><p className="mt-1 text-sm text-muted-foreground">{word.verification.note}</p></div></div>}
      {word.exampleTarget && <div className="rounded-2xl bg-muted p-4"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Im Satz</p><strong className="mt-2 block text-lg">{word.exampleTarget}</strong><p className="text-sm text-muted-foreground">{word.exampleTranslation}</p></div>}
      {word.lemma && <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border p-4"><span className="text-xs text-muted-foreground">Grundform</span><strong className="mt-1 block text-lg">{word.lemma}</strong></div><div className="rounded-2xl border p-4"><span className="text-xs text-muted-foreground">Wortart</span><strong className="mt-1 block text-lg">Verb</strong></div></div>}
      {exercises.length ? <div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Aktiv trainieren</p><h3 className="font-heading text-2xl font-bold">Übungen zu diesem Wort</h3><div className="mt-3 grid gap-3 sm:grid-cols-2"><button className="rounded-2xl border bg-card p-4 text-left transition hover:border-primary/30 hover:shadow-md" onClick={() => onPractice(grammar)}><BookOpenCheck className="size-5 text-primary" /><strong className="mt-3 block">Grammatik üben</strong><span className="text-sm text-muted-foreground">{grammar.length} Aufgaben: Formen, Verneinung, Aufbau</span></button><button disabled={!sentences.length} className="rounded-2xl border bg-card p-4 text-left transition hover:border-primary/30 hover:shadow-md disabled:opacity-45" onClick={() => onPractice(sentences)}><CheckCircle2 className="size-5 text-primary" /><strong className="mt-3 block">Satz üben</strong><span className="text-sm text-muted-foreground">Den Beispielsatz selbst bilden und prüfen</span></button></div></div> : <div className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">Für dieses Wort gibt es noch kein Verbprofil. Du kannst weiterhin einen Beispielsatz und eigene Hinweise hinterlegen.</div>}
      {(word.personalMnemonic || word.mnemonicSuggestion) && <div className="flex gap-3 rounded-2xl border border-[#ead4a4] bg-[#fff8e8] p-4"><Lightbulb className="size-5 shrink-0 text-[#8d651d]" /><p className="text-sm">{word.personalMnemonic || word.mnemonicSuggestion}</p></div>}
    </div>
    <footer className="border-t p-4"><Button variant="outline" className="w-full rounded-xl" onClick={onEdit}><Pencil /> Vokabel bearbeiten</Button></footer>
  </div></dialog>;
}
