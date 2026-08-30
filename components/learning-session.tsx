'use client';

import { useEffect, useState } from 'react';
import { Check, Volume2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { getMedia } from '@/lib/db';
import { intervalLabel, ratingLabels } from '@/lib/scheduler';
import type { VocabularyItem } from '@/lib/types';

export type Grade = 1 | 2 | 3 | 4;

function AudioAsset({ id }: { id?: string }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    let objectUrl = '';
    void getMedia(id).then((blob) => {
      if (!blob) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    }).catch(() => undefined);
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [id]);
  return url ? <audio controls src={url} className="mt-3 h-9 max-w-full" /> : null;
}

function ImageAsset({ id }: { id?: string }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    let objectUrl = '';
    void getMedia(id).then((blob) => {
      if (!blob) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    }).catch(() => undefined);
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [id]);
  return url ? <img src={url} alt="Persönliche Gedächtnisstütze" className="mb-5 h-36 w-56 rounded-2xl object-cover shadow-md" /> : null;
}

function normalize(value: string) {
  return value.toLocaleLowerCase('de').replace(/[.,!?()]/g, '').replace(/\s+/g, ' ').trim();
}

export function LearningSession({ words, onClose, onReview }: { words: VocabularyItem[]; onClose: () => void; onReview: (item: VocabularyItem, grade: Grade) => void }) {
  const [queue, setQueue] = useState(words.map((word) => ({ word, tries: 0 })));
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [doneIds, setDoneIds] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const current = queue[index];
  const expected = current?.word.translation.split('/')[0].trim() ?? '';
  const roughlyCorrect = Boolean(normalize(answer)) && (normalize(current.word.translation).includes(normalize(answer)) || normalize(answer).includes(normalize(expected)));

  const speak = () => {
    if (!current || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(current.word.target);
    utterance.lang = 'sw-TZ';
    utterance.rate = 0.8;
    void speechSynthesis.speak(utterance);
  };

  const rate = (grade: Grade) => {
    onReview(current.word, grade);
    let nextQueue = queue;
    if (grade === 1 && current.tries < 1) {
      nextQueue = [...queue, { word: current.word, tries: 1 }];
      setQueue(nextQueue);
    } else {
      setDoneIds((ids) => ids.includes(current.word.id) ? ids : [...ids, current.word.id]);
    }
    if (index + 1 >= nextQueue.length) setFinished(true);
    else { setIndex(index + 1); setAnswer(''); setRevealed(false); }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#082b28]/60 p-3 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" className="w-full max-w-3xl overflow-hidden rounded-3xl bg-card shadow-2xl">
        {finished ? (
          <div className="mx-auto max-w-md p-8 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-primary/10"><Check className="size-8 text-primary" /></span>
            <h2 className="mt-5 font-heading text-3xl font-bold">Hongera!</h2>
            <p className="mt-2 text-muted-foreground">Deine Runde ist geschafft. Sieben Wörter haben gerade eine stärkere Gedächtnisspur bekommen.</p>
            <Button className="mt-6 w-full rounded-xl" onClick={onClose}>Zurück zum Überblick</Button>
          </div>
        ) : (
          <div className="flex min-h-[620px] flex-col">
            <header className="flex items-center gap-3 border-b p-4">
              <Button size="icon" variant="ghost" onClick={onClose} aria-label="Runde schließen"><X /></Button>
              <div className="flex-1"><div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>Deine 7er-Runde</span><span>{Math.min(doneIds.length + 1, words.length)} / {words.length}</span></div><Progress value={doneIds.length / words.length * 100} /></div>
            </header>
            <div className="flex flex-1 flex-col items-center justify-center p-5 sm:p-10">
              <ImageAsset id={current.word.imageMediaId} />
              <span className="rounded-full bg-primary/8 px-3 py-1 text-xs font-medium text-primary">{current.word.category}</span>
              <h2 className="mt-5 text-center font-heading text-4xl font-bold text-primary sm:text-5xl">{current.word.target}</h2>
              <button onClick={speak} className="mt-4 flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-muted"><Volume2 className="size-4" /> Gerätestimme</button>
              <AudioAsset id={current.word.audioMediaId} />
              <div className="mt-8 w-full max-w-lg">
                <label className="mb-2 block text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Was bedeutet das?</label>
                <Input autoFocus value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') setRevealed(true); }} className="h-12 rounded-xl text-center text-base" placeholder="Deine deutsche Antwort …" />
                {!revealed ? <Button className="mt-3 h-11 w-full rounded-xl" onClick={() => setRevealed(true)}>Antwort zeigen</Button> : (
                  <div className="mt-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className={`rounded-2xl p-4 text-center ${roughlyCorrect ? 'bg-[#e4f4ec]' : 'bg-muted'}`}><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lösung</p><strong className="mt-1 block text-xl">{current.word.translation}</strong>{current.word.exampleTarget && <p className="mt-3 text-sm"><span className="font-medium">{current.word.exampleTarget}</span><br /><span className="text-muted-foreground">{current.word.exampleTranslation}</span></p>}</div>
                    {(current.word.personalMnemonic || current.word.mnemonicSuggestion) && <div className="mt-3 rounded-2xl border border-[#ead4a4] bg-[#fff8e8] p-4 text-sm"><span className="mb-1 block text-xs font-semibold text-[#8d651d]">Eselsbrücke</span>{current.word.personalMnemonic || current.word.mnemonicSuggestion}</div>}
                    <p className="mt-4 text-center text-xs text-muted-foreground">„Nochmal“ erscheint später in dieser Runde. Der nächste Tagestermin steht darunter.</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">{([1, 2, 3, 4] as Grade[]).map((grade) => <Button key={grade} variant={grade === 3 ? 'default' : 'outline'} className="h-auto flex-col gap-0 rounded-xl py-2" onClick={() => rate(grade)}><span>{ratingLabels[grade].label}</span><span className="text-[10px] font-normal opacity-65">{grade === 1 ? `diese Runde · ${intervalLabel(current.word.card, grade)}` : intervalLabel(current.word.card, grade)}</span></Button>)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
