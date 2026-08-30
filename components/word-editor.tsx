'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Check, Mic2, Square, Trash2, Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getMedia, saveMedia } from '@/lib/db';
import { newCard } from '@/lib/scheduler';
import type { VocabularyItem } from '@/lib/types';

function StoredMedia({ id, kind }: { id?: string; kind: 'image' | 'audio' }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    let objectUrl = '';
    void getMedia(id).then((blob) => { if (blob) { objectUrl = URL.createObjectURL(blob); setUrl(objectUrl); } }).catch(() => undefined);
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [id]);
  if (!url) return null;
  return kind === 'image' ? <img src={url} alt="Bildvorschau" className="mt-3 h-28 w-full rounded-xl object-cover" /> : <audio controls src={url} className="mt-3 h-9 max-w-full" />;
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label><span className="mb-2 block text-sm font-medium">{label}</span><Input value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

export function WordEditor({ item, onClose, onSave, onDelete }: { item?: VocabularyItem; onClose: () => void; onSave: (item: VocabularyItem) => void; onDelete: (id: string) => void }) {
  const now = new Date().toISOString();
  const [draft, setDraft] = useState<VocabularyItem>(item ?? { id: crypto.randomUUID(), language: 'sw', target: '', translation: '', category: 'Eigene Wörter', card: newCard(), createdAt: now, updatedAt: now });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<Blob | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [recording, setRecording] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    if (!imageFile) return setImagePreview('');
    const url = URL.createObjectURL(imageFile); setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(stream);
      recorder.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) => chunks.push(event.data);
      mediaRecorder.onstop = () => { setAudioFile(new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' })); stream.getTracks().forEach((track) => track.stop()); setRecording(false); };
      mediaRecorder.start(); setRecording(true);
    } catch { window.alert('Das Mikrofon konnte nicht geöffnet werden. Prüfe bitte die Browserfreigabe.'); }
  };

  const submit = async () => {
    if (!draft.target.trim() || !draft.translation.trim()) return;
    const next = { ...draft, updatedAt: new Date().toISOString(), needsReview: false };
    if (imageFile) { next.imageMediaId = `image-${draft.id}`; await saveMedia(next.imageMediaId, imageFile); }
    if (audioFile) { next.audioMediaId = `audio-${draft.id}`; await saveMedia(next.audioMediaId, audioFile); }
    onSave(next);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#082b28]/60 p-3 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-card shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-card/95 p-4 backdrop-blur"><div><p className="text-xs text-muted-foreground">{item ? 'Vokabel bearbeiten' : 'Neue Vokabel'}</p><h2 className="font-heading text-2xl font-bold">{draft.target || 'Neues Wort'}</h2></div><Button size="icon" variant="ghost" onClick={onClose}><X /></Button></header>
        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <Field label="Swahili" value={draft.target} onChange={(target) => setDraft({ ...draft, target })} />
          <Field label="Deutsch" value={draft.translation} onChange={(translation) => setDraft({ ...draft, translation })} />
          <Field label="Kategorie" value={draft.category} onChange={(category) => setDraft({ ...draft, category })} />
          <Field label="Wortbausteine (mit Komma)" value={draft.morphemes?.join(', ') ?? ''} onChange={(value) => setDraft({ ...draft, morphemes: value.split(',').map((part) => part.trim()).filter(Boolean) })} />
          <Field label="Beispielsatz auf Swahili" value={draft.exampleTarget ?? ''} onChange={(exampleTarget) => setDraft({ ...draft, exampleTarget })} />
          <Field label="Übersetzung des Satzes" value={draft.exampleTranslation ?? ''} onChange={(exampleTranslation) => setDraft({ ...draft, exampleTranslation })} />
          <label className="sm:col-span-2"><span className="mb-2 block text-sm font-medium">Vorgeschlagene Eselsbrücke</span><Textarea value={draft.mnemonicSuggestion ?? ''} onChange={(event) => setDraft({ ...draft, mnemonicSuggestion: event.target.value })} placeholder="Ein Beispiel, das man übernehmen oder verändern kann …" /></label>
          <label className="sm:col-span-2"><span className="mb-2 block text-sm font-medium">Meine persönliche Eselsbrücke</span><Textarea value={draft.personalMnemonic ?? ''} onChange={(event) => setDraft({ ...draft, personalMnemonic: event.target.value })} placeholder="Je persönlicher und verrückter, desto besser." /></label>
          <div className="rounded-2xl border border-dashed p-4"><div className="flex items-center gap-2 font-medium"><Camera className="size-4 text-primary" /> Persönliches Bild</div><p className="mt-1 text-xs text-muted-foreground">KI-Bild im Chat erzeugen, speichern und hier auswählen – ohne App-API-Kosten.</p>{imagePreview ? <img src={imagePreview} alt="Neue Bildvorschau" className="mt-3 h-28 w-full rounded-xl object-cover" /> : <StoredMedia id={draft.imageMediaId} kind="image" />}<label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-muted"><Camera className="size-4" /> Bild auswählen<input hidden type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} /></label></div>
          <div className="rounded-2xl border border-dashed p-4"><div className="flex items-center gap-2 font-medium"><Mic2 className="size-4 text-primary" /> Aussprache</div><p className="mt-1 text-xs text-muted-foreground">Audio hochladen oder direkt selbst aufnehmen.</p><div className="mt-3 flex flex-wrap gap-2"><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-muted"><Upload className="size-4" /> Audio<input hidden type="file" accept="audio/*" onChange={(event) => setAudioFile(event.target.files?.[0] ?? null)} /></label><Button type="button" variant={recording ? 'destructive' : 'outline'} className="rounded-xl" onClick={() => recording ? recorder.current?.stop() : startRecording()}>{recording ? <><Square /> Stoppen</> : <><Mic2 /> Aufnehmen</>}</Button></div>{audioFile ? <p className="mt-2 text-xs font-medium text-primary">Neue Aufnahme bereit</p> : <StoredMedia id={draft.audioMediaId} kind="audio" />}</div>
        </div>
        <footer className="flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-between">{item ? <Button variant="ghost" className="text-destructive" onClick={() => onDelete(item.id)}><Trash2 /> Löschen</Button> : <span />}<div className="flex gap-2"><Button variant="outline" className="flex-1 rounded-xl sm:flex-none" onClick={onClose}>Abbrechen</Button><Button className="flex-1 rounded-xl sm:flex-none" disabled={!draft.target.trim() || !draft.translation.trim()} onClick={submit}><Check /> Speichern</Button></div></footer>
      </div>
    </div>
  );
}
