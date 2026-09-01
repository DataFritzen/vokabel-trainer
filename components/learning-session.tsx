'use client';

import { useEffect, useState } from 'react';
import { Check, ImagePlus, Lightbulb, Save, Volume2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { getMedia } from '@/lib/db';
import { intervalLabel, masteryPercent, ratingLabels } from '@/lib/scheduler';
import type { VocabularyItem } from '@/lib/types';

export type Grade = 1 | 2 | 3 | 4;
type MemoryHelpValues = { personalMnemonic?: string; image?: File };

function AudioAsset({ id }: { id?: string }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    let objectUrl = '';
    void getMedia(id)
      .then((blob) => {
        if (!blob) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => undefined);
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);
  return url ? (
    // The learner records pronunciation, so there is no separate spoken caption track.
    // oxlint-disable-next-line jsx-a11y/media-has-caption
    <audio controls src={url} className="mt-3 h-9 max-w-full" />
  ) : null;
}

function ImageAsset({ id }: { id?: string }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    let objectUrl = '';
    void getMedia(id)
      .then((blob) => {
        if (!blob) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => undefined);
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);
  return url ? (
    // Blob URLs from IndexedDB cannot be passed to next/image's loader.
    // oxlint-disable-next-line next/no-img-element
    <img
      src={url}
      alt="Persönliche Gedächtnisstütze"
      className="mb-5 h-36 w-56 rounded-2xl object-cover shadow-md"
    />
  ) : null;
}

function normalize(value: string) {
  return value
    .toLocaleLowerCase('de')
    .replace(/[.,!?()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function MemoryHelpEditor({
  word,
  onSave,
  onSaved,
}: {
  word: VocabularyItem;
  onSave: (
    item: VocabularyItem,
    values: MemoryHelpValues,
  ) => Promise<VocabularyItem>;
  onSaved: (item: VocabularyItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mnemonic, setMnemonic] = useState(word.personalMnemonic ?? '');
  const [image, setImage] = useState<File>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!open)
    return (
      <Button
        variant="outline"
        className="mt-4 rounded-xl"
        onClick={() => setOpen(true)}
      >
        <ImagePlus />
        {word.card.reps === 0
          ? 'Eselsbrücke oder Bild ergänzen'
          : 'Lernhilfe ergänzen'}
      </Button>
    );

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await onSave(word, { personalMnemonic: mnemonic, image });
      onSaved(updated);
      setOpen(false);
    } catch {
      setError('Die Lernhilfe konnte nicht gespeichert werden.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 w-full max-w-lg rounded-2xl border border-[#ead4a4] bg-[#fff8e8] p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#7c5b20]">
        <Lightbulb className="size-4" /> Persönliche Lernhilfe
      </div>
      <label
        className="mt-3 block text-xs font-medium"
        htmlFor={`mnemonic-${word.id}`}
      >
        Meine Eselsbrücke
      </label>
      <Input
        id={`mnemonic-${word.id}`}
        className="mt-1 bg-card"
        value={mnemonic}
        onChange={(event) => setMnemonic(event.target.value)}
        placeholder="Was erinnert dich persönlich an dieses Wort?"
      />
      <label
        className="mt-3 block text-xs font-medium"
        htmlFor={`memory-image-${word.id}`}
      >
        Eigenes oder KI-generiertes Bild
      </label>
      <input
        id={`memory-image-${word.id}`}
        type="file"
        accept="image/*"
        className="mt-1 block w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:font-semibold file:text-primary"
        onChange={(event) => setImage(event.target.files?.[0])}
      />
      {image && (
        <p className="mt-1 truncate text-[11px] text-muted-foreground">
          {image.name}
        </p>
      )}
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          className="rounded-lg"
          disabled={saving}
          onClick={save}
        >
          <Save /> {saving ? 'Speichert …' : 'Lernhilfe speichern'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="rounded-lg"
          onClick={() => setOpen(false)}
        >
          Abbrechen
        </Button>
      </div>
    </div>
  );
}

export function LearningSession({
  words,
  roundNumber,
  onClose,
  onReview,
  onSaveMemoryHelp,
  onRepeat,
  onNewRound,
}: {
  words: VocabularyItem[];
  roundNumber: number;
  onClose: () => void;
  onReview: (item: VocabularyItem, grade: Grade) => void;
  onSaveMemoryHelp: (
    item: VocabularyItem,
    values: MemoryHelpValues,
  ) => Promise<VocabularyItem>;
  onRepeat: () => void;
  onNewRound: () => void;
}) {
  const [queue, setQueue] = useState(words.map((word) => ({ word, tries: 0 })));
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [doneIds, setDoneIds] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const current = queue[index];
  if (!current)
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-[#082b28]/60 p-3 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-3xl bg-card p-7 text-center shadow-2xl">
          <h2 className="font-heading text-2xl font-bold">
            Keine Karten ausgewählt
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Bitte stelle eine neue Runde zusammen.
          </p>
          <Button className="mt-5 w-full rounded-xl" onClick={onClose}>
            Runde schließen
          </Button>
        </div>
      </div>
    );
  const mnemonic =
    current?.word.personalMnemonic || current?.word.mnemonicSuggestion;
  const showMnemonic =
    Boolean(mnemonic) && (revealed || masteryPercent(current.word.card) < 60);
  const expected = current?.word.translation.split('/')[0].trim() ?? '';
  const roughlyCorrect =
    Boolean(normalize(answer)) &&
    (normalize(current.word.translation).includes(normalize(answer)) ||
      normalize(answer).includes(normalize(expected)));

  const speak = () => {
    if (!current || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(current.word.target);
    utterance.lang = 'sw-TZ';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  const rate = (grade: Grade) => {
    onReview(current.word, grade);
    let nextQueue = queue;
    if (grade === 1 && current.tries < 1) {
      nextQueue = [...queue, { word: current.word, tries: 1 }];
      setQueue(nextQueue);
    } else {
      setDoneIds((ids) =>
        ids.includes(current.word.id) ? ids : [...ids, current.word.id],
      );
    }
    if (index + 1 >= nextQueue.length) setFinished(true);
    else {
      setIndex(index + 1);
      setAnswer('');
      setRevealed(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#082b28]/60 p-3 backdrop-blur-sm">
      <dialog
        open
        aria-modal="true"
        className="w-full max-w-3xl overflow-hidden rounded-3xl bg-card shadow-2xl"
      >
        {finished ? (
          <div className="mx-auto max-w-md p-8 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-primary/10">
              <Check className="size-8 text-primary" />
            </span>
            <h2 className="mt-5 font-heading text-3xl font-bold">Hongera!</h2>
            <p className="mt-2 text-muted-foreground">
              Runde {roundNumber} ist geschafft. Du entscheidest, ob dieselben
              sieben Karten noch einmal kommen oder der Tagesalgorithmus neu
              auswählt.
            </p>
            <div className="mt-6 grid gap-2">
              <Button className="w-full rounded-xl" onClick={onRepeat}>
                Gleiche Runde wiederholen
              </Button>
              <Button
                className="w-full rounded-xl"
                variant="outline"
                onClick={onNewRound}
              >
                Neue Runde zusammenstellen
              </Button>
              <Button
                className="w-full rounded-xl"
                variant="ghost"
                onClick={onClose}
              >
                Für jetzt beenden
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[620px] flex-col">
            <header className="flex items-center gap-3 border-b p-4">
              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
                aria-label="Runde schließen"
              >
                <X />
              </Button>
              <div className="flex-1">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Runde {roundNumber} heute</span>
                  <span>
                    {Math.min(doneIds.length + 1, words.length)} /{' '}
                    {words.length}
                  </span>
                </div>
                <Progress value={(doneIds.length / words.length) * 100} />
              </div>
            </header>
            <div className="flex flex-1 flex-col items-center justify-center p-5 sm:p-10">
              <ImageAsset id={current.word.imageMediaId} />
              <span className="rounded-full bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
                {current.word.category}
              </span>
              <h2 className="mt-5 text-center font-heading text-4xl font-bold text-primary sm:text-5xl">
                {current.word.target}
              </h2>
              <button
                onClick={speak}
                className="mt-4 flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-muted"
              >
                <Volume2 className="size-4" /> Gerätestimme
              </button>
              <AudioAsset id={current.word.audioMediaId} />
              <MemoryHelpEditor
                key={current.word.id}
                word={current.word}
                onSave={onSaveMemoryHelp}
                onSaved={(updated) =>
                  setQueue((items) =>
                    items.map((entry) =>
                      entry.word.id === updated.id
                        ? { ...entry, word: updated }
                        : entry,
                    ),
                  )
                }
              />
              <div className="mt-8 w-full max-w-lg">
                <label
                  htmlFor="round-answer"
                  className="mb-2 block text-center text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Was bedeutet das?
                </label>
                <Input
                  id="round-answer"
                  autoFocus
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') setRevealed(true);
                  }}
                  className="h-12 rounded-xl text-center text-base"
                  placeholder="Deine deutsche Antwort …"
                />
                {!revealed ? (
                  <Button
                    className="mt-3 h-11 w-full rounded-xl"
                    onClick={() => setRevealed(true)}
                  >
                    Antwort zeigen
                  </Button>
                ) : (
                  <div className="mt-4 animate-in fade-in slide-in-from-bottom-2">
                    <div
                      className={`rounded-2xl p-4 text-center ${roughlyCorrect ? 'bg-[#e4f4ec]' : 'bg-muted'}`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Lösung
                      </p>
                      <strong className="mt-1 block text-xl">
                        {current.word.translation}
                      </strong>
                      {current.word.exampleTarget && (
                        <p className="mt-3 text-sm">
                          <span className="font-medium">
                            {current.word.exampleTarget}
                          </span>
                          <br />
                          <span className="text-muted-foreground">
                            {current.word.exampleTranslation}
                          </span>
                        </p>
                      )}
                    </div>
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                      „Nochmal“ erscheint später in dieser Runde. Der nächste
                      Tagestermin steht darunter.
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {([1, 2, 3, 4] as Grade[]).map((grade) => (
                        <Button
                          key={grade}
                          variant={grade === 3 ? 'default' : 'outline'}
                          className="h-auto flex-col gap-0 rounded-xl py-2"
                          onClick={() => rate(grade)}
                        >
                          <span>{ratingLabels[grade].label}</span>
                          <span className="text-[10px] font-normal opacity-65">
                            {grade === 1
                              ? `diese Runde · ${intervalLabel(current.word.card, grade)}`
                              : intervalLabel(current.word.card, grade)}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                {showMnemonic && (
                  <div className="mt-3 flex gap-3 rounded-2xl border border-[#ead4a4] bg-[#fff8e8] p-4 text-sm">
                    <Lightbulb className="size-5 shrink-0 text-[#8d651d]" />
                    <div>
                      <span className="mb-1 block text-xs font-semibold text-[#8d651d]">
                        Eselsbrücke
                      </span>
                      {mnemonic}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
