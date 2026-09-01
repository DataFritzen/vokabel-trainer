'use client';

import { Check, Lightbulb, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { intervalLabel, masteryPercent, ratingLabels } from '@/lib/scheduler';
import { taskCard, type VocabularyTrainingTask } from '@/lib/vocabulary-training';
import type { Grade } from '@/components/learning-session';

function normalize(value: string) { return value.toLocaleLowerCase('de').replace(/[.,!?()]/g, '').replace(/\s+/g, ' ').trim(); }

export function VocabularyTrainingSession({ tasks, onClose, onReview, onRepeat, onNewSet }: { tasks: VocabularyTrainingTask[]; onClose: () => void; onReview: (task: VocabularyTrainingTask, grade: Grade) => void; onRepeat: () => void; onNewSet: () => void }) {
  const [queue, setQueue] = useState(tasks.map((task) => ({ task, tries: 0 })));
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const current = queue[index];
  const alternatives = [current?.task.answer, ...(current?.task.alternatives ?? [])].filter(Boolean).map(normalize);
  const roughlyCorrect = Boolean(normalize(answer)) && alternatives.some((value) => value.includes(normalize(answer)) || normalize(answer).includes(value));
  const mnemonic = current?.task.word.personalMnemonic || current?.task.word.mnemonicSuggestion;
  const showMnemonic = Boolean(mnemonic) && (revealed || masteryPercent(current.task.word.card) < 60);

  const rate = (grade: Grade) => {
    onReview(current.task, grade);
    let nextQueue = queue;
    if (grade === 1 && current.tries < 1) { nextQueue = [...queue, { task: current.task, tries: 1 }]; setQueue(nextQueue); }
    if (index + 1 >= nextQueue.length) setFinished(true);
    else { setIndex(index + 1); setAnswer(''); setRevealed(false); }
  };

  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#082b28]/60 p-3 backdrop-blur-sm"><dialog open className="m-0 w-full max-w-3xl overflow-hidden rounded-3xl border-0 bg-card p-0 text-foreground shadow-2xl">{finished ? <div className="mx-auto max-w-md p-8 text-center"><span className="mx-auto grid size-16 place-items-center rounded-full bg-primary/10"><Check className="size-8 text-primary" /></span><h2 className="mt-5 font-heading text-3xl font-bold">Training abgeschlossen</h2><p className="mt-2 text-sm text-muted-foreground">Nur die geübten Teilbereiche wurden bewertet. Eine Wiederholung am selben Tag festigt; die langfristige Sicherheit wächst über weitere Lerntage.</p><div className="mt-6 grid gap-2"><Button className="rounded-xl" onClick={onRepeat}>Gleiche Aufgaben wiederholen</Button><Button variant="outline" className="rounded-xl" onClick={onNewSet}>Neue Schwachstellen wählen</Button><Button variant="ghost" className="rounded-xl" onClick={onClose}>Beenden</Button></div></div> : <div className="flex min-h-[640px] flex-col"><header className="flex items-center gap-3 border-b p-4"><Button size="icon" variant="ghost" onClick={onClose} aria-label="Training schließen"><X /></Button><div className="flex-1"><div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>{current.task.label}</span><span>{index + 1} / {queue.length}</span></div><Progress value={index / queue.length * 100} /></div></header><div className="flex flex-1 flex-col items-center justify-center p-5 sm:p-10"><span className="rounded-full bg-primary/8 px-3 py-1 text-xs font-medium text-primary">{current.task.word.target} · {current.task.label}</span><h2 className="mt-6 max-w-2xl text-center font-heading text-3xl font-bold text-primary sm:text-4xl">{current.task.prompt}</h2><div className="mt-8 w-full max-w-xl"><Input autoFocus value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') setRevealed(true); }} className="h-12 rounded-xl text-center" placeholder="Deine Antwort …" />{current.task.hint && !revealed && <p className="mt-2 text-center text-xs text-muted-foreground">Hinweis: {current.task.hint}</p>}{!revealed ? <Button className="mt-3 h-11 w-full rounded-xl" onClick={() => setRevealed(true)}>Antwort prüfen</Button> : <div className="mt-4"><div className={`rounded-2xl p-4 text-center ${roughlyCorrect ? 'bg-[#e4f4ec]' : 'bg-muted'}`}><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lösung</p><strong className="mt-1 block text-xl">{current.task.answer}</strong><p className="mt-2 text-sm text-muted-foreground">{current.task.explanation}</p></div><details className="mt-3 rounded-xl border p-3 text-sm"><summary className="cursor-pointer font-semibold text-primary">Verknüpfungen zu dieser Vokabel</summary><div className="mt-3 space-y-2 text-muted-foreground">{current.task.word.exampleTarget && <p><strong className="text-foreground">Satz:</strong> {current.task.word.exampleTarget} – {current.task.word.exampleTranslation}</p>}{current.task.word.lemma && <p><strong className="text-foreground">Grundform:</strong> {current.task.word.lemma}</p>}{current.task.word.languageGuidance && <><p><strong className="text-foreground">Anfängerfehler:</strong> {current.task.word.languageGuidance.commonMistake}</p><p><strong className="text-foreground">Paje & Michamvi:</strong> {current.task.word.languageGuidance.localUsage}</p></>}</div></details><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{([1, 2, 3, 4] as Grade[]).map((grade) => <Button key={grade} variant={grade === 3 ? 'default' : 'outline'} className="h-auto flex-col gap-0 rounded-xl py-2" onClick={() => rate(grade)}><span>{ratingLabels[grade].label}</span><span className="text-[10px] font-normal opacity-65">{intervalLabel(taskCard(current.task), grade)}</span></Button>)}</div></div>}{showMnemonic && <div className="mt-4 flex gap-3 rounded-2xl border border-[#ead4a4] bg-[#fff8e8] p-4 text-sm"><Lightbulb className="size-5 shrink-0 text-[#8d651d]" /><div><span className="mb-1 block text-xs font-semibold text-[#8d651d]">Eselsbrücke</span>{mnemonic}</div></div>}</div></div></div>}</dialog></div>;
}
