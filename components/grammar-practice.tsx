'use client';

import { useState } from 'react';
import { Check, Lightbulb, X } from 'lucide-react';

import type { Grade } from '@/components/learning-session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { intervalLabel, ratingLabels } from '@/lib/scheduler';
import type { GrammarExercise } from '@/lib/types';

function normalize(value: string) {
  return value.toLocaleLowerCase('de').normalize('NFKD').replace(/[.,!?„“"'()\-/]/g, ' ').replace(/\s+/g, ' ').trim();
}

function isCorrect(answer: string, exercise: GrammarExercise) {
  const submitted = normalize(answer);
  return Boolean(submitted) && [exercise.answer, ...(exercise.alternatives ?? [])].some((value) => normalize(value) === submitted);
}

export function GrammarPractice({ exercises, onClose, onReview }: { exercises: GrammarExercise[]; onClose: () => void; onReview: (exercise: GrammarExercise, grade: Grade) => void }) {
  const [queue, setQueue] = useState(exercises.map((exercise) => ({ exercise, repeated: false })));
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const current = queue[index];
  const correct = current ? isCorrect(answer, current.exercise) : false;

  const rate = (grade: Grade) => {
    onReview(current.exercise, grade);
    let nextQueue = queue;
    if (grade === 1 && !current.repeated) {
      nextQueue = [...queue, { exercise: current.exercise, repeated: true }];
      setQueue(nextQueue);
    }
    if (index + 1 >= nextQueue.length) setFinished(true);
    else { setIndex(index + 1); setAnswer(''); setRevealed(false); }
  };

  return <dialog open className="fixed inset-0 z-[70] m-0 grid h-full max-h-none w-full max-w-none place-items-center border-0 bg-[#082b28]/65 p-3 backdrop-blur-sm">
    <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-card text-foreground shadow-2xl">
      {finished ? <div className="mx-auto max-w-md p-9 text-center"><span className="mx-auto grid size-16 place-items-center rounded-full bg-primary/10"><Check className="size-8 text-primary" /></span><h2 className="mt-5 font-heading text-3xl font-bold">Grammatikrunde geschafft</h2><p className="mt-2 text-sm text-muted-foreground">Die einzelnen Strukturen sind jetzt separat für ihre nächsten Wiederholungen geplant.</p><Button className="mt-6 w-full rounded-xl" onClick={onClose}>Fertig</Button></div> : <>
        <header className="flex items-center gap-3 border-b p-4"><Button size="icon" variant="ghost" onClick={onClose}><X /></Button><div className="flex-1"><div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>Grammatik & Satzbau</span><span>{index + 1} / {queue.length}</span></div><Progress value={index / queue.length * 100} /></div></header>
        <div className="mx-auto flex min-h-[570px] max-w-2xl flex-col justify-center p-6 sm:p-10">
          <span className="w-fit rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">{current.exercise.kind === 'sentence' ? 'Satzübung' : 'Grammatikübung'}</span>
          <h2 className="mt-5 font-heading text-3xl font-bold">{current.exercise.title}</h2>
          <p className="mt-3 text-lg leading-relaxed">{current.exercise.prompt}</p>
          <div className="mt-7"><Input autoFocus className="h-12 rounded-xl text-base" placeholder="Deine Antwort auf Swahili …" value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') setRevealed(true); }} />
            {!revealed ? <><div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><Lightbulb className="size-4" />{current.exercise.hint ?? 'Achte auf Subjekt- und Zeitmarker.'}</div><Button className="mt-4 w-full rounded-xl" onClick={() => setRevealed(true)}>Prüfen</Button></> : <div className="mt-4">
              <div className={`rounded-2xl p-5 ${correct ? 'bg-[#e4f4ec]' : 'bg-[#fff3df]'}`}><p className="text-xs font-semibold uppercase tracking-wider">{correct ? 'Richtig' : 'Modelllösung'}</p><strong className="mt-1 block text-2xl">{current.exercise.answer}</strong><p className="mt-3 text-sm text-muted-foreground">{current.exercise.explanation}</p></div>
              <p className="mt-4 text-center text-xs text-muted-foreground">Bewerte, wie sicher du die Form selbst bilden konntest.</p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">{([1, 2, 3, 4] as Grade[]).map((grade) => <Button key={grade} variant={grade === 3 ? 'default' : 'outline'} className="h-auto flex-col gap-0 rounded-xl py-2" onClick={() => rate(grade)}><span>{ratingLabels[grade].label}</span><span className="text-[10px] font-normal opacity-65">{intervalLabel(current.exercise.card, grade)}</span></Button>)}</div>
            </div>}
          </div>
        </div>
      </>}
    </div>
  </dialog>;
}
