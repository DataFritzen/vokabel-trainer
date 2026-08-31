'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpenCheck, BookOpenText, CalendarDays, Check, CircleAlert, Download, Flame, Headphones, Languages, Library, Mic2, Plus, Search, Settings2, Sparkles, Upload, Volume2 } from 'lucide-react';

import { GrammarHub } from '@/components/grammar-hub';
import { GrammarPractice } from '@/components/grammar-practice';
import { LearningSession, type Grade } from '@/components/learning-session';
import { ProfileDashboard } from '@/components/profile-dashboard';
import { VocabularyDetail } from '@/components/vocabulary-detail';
import { WordEditor } from '@/components/word-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { createBackup, loadSnapshot, restoreBackup, saveSnapshot } from '@/lib/db';
import { grammarExercisesForVocabulary } from '@/lib/grammar-content';
import { isDue, schedule } from '@/lib/scheduler';
import type { AppSnapshot, BackupFile, GrammarExercise, VocabularyItem } from '@/lib/types';

type View = 'today' | 'words' | 'grammar' | 'progress' | 'settings';
type SessionState = { words: VocabularyItem[]; nonce: number };

function dateLabel() {
  return new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
}

function localDayKey(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function reviewDayKey(review: AppSnapshot['reviews'][number]) {
  return review.dayKey ?? review.reviewedAt.slice(0, 10);
}

function downloadJson(name: string, data: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click(); URL.revokeObjectURL(url);
}

function buildDailyRound(snapshot: AppSnapshot, words: VocabularyItem[], roundNumber: number) {
  const dayKey = localDayKey();
  const reviews = snapshot.reviews.filter((review) => reviewDayKey(review) === dayKey);
  const lastByWord = new Map<string, (typeof reviews)[number]>();
  for (const review of reviews) lastByWord.set(review.vocabularyId, review);

  const activeIds = new Set(snapshot.activeRound?.dayKey === dayKey ? snapshot.activeRound.vocabularyIds : []);
  const pool = words.filter((word) => {
    const seenToday = lastByWord.has(word.id);
    return word.card.reps === 0 || seenToday || isDue(word.card);
  });

  const score = (word: VocabularyItem) => {
    const review = lastByWord.get(word.id);
    if (!review) return (word.card.reps > 0 && isDue(word.card) ? 500 : 400) - (activeIds.has(word.id) ? 20 : 0);
    const roundsSince = roundNumber - (review.roundNumber ?? roundNumber - 1);
    if (review.rating === 1) return roundsSince >= 1 ? 700 : 0;
    if (review.rating === 2) return roundsSince >= 1 ? 620 : 0;
    if (review.rating === 3) return roundsSince >= 2 ? 480 : 20;
    return 10;
  };

  return [...pool].sort((a, b) => score(b) - score(a) || a.card.reps - b.card.reps).slice(0, snapshot.settings.dailyGoal);
}

export function SemaApp() {
  const [snapshot, setSnapshot] = useState<AppSnapshot | null>(null);
  const [view, setView] = useState<View>('today');
  const [editing, setEditing] = useState<VocabularyItem | 'new' | null>(null);
  const [selectedWord, setSelectedWord] = useState<VocabularyItem | null>(null);
  const [session, setSession] = useState<SessionState | null>(null);
  const [grammarSession, setGrammarSession] = useState<GrammarExercise[] | null>(null);
  const [diagnostic, setDiagnostic] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { loadSnapshot().then(setSnapshot).catch(() => setToast('Die lokalen Daten konnten nicht geöffnet werden.')); }, []);
  useEffect(() => { if (!snapshot) return; const timer = setTimeout(() => saveSnapshot(snapshot).catch(() => setToast('Speichern fehlgeschlagen.')), 120); return () => clearTimeout(timer); }, [snapshot]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 3200); return () => clearTimeout(timer); }, [toast]);

  if (!snapshot) return <main className="grid min-h-screen place-items-center bg-background text-foreground"><div className="text-center"><span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-primary text-xl font-bold text-white">7</span><p className="text-sm text-muted-foreground">Dein Sprachweg wird geladen …</p></div></main>;

  const words = snapshot.vocabulary.filter((word) => word.language === snapshot.settings.activeLanguage);
  const due = words.filter((word) => isDue(word.card)).length;
  const learned = words.filter((word) => word.card.state === 2 && word.card.reps >= 2).length;
  const todayKey = localDayKey();
  const todayCount = snapshot.reviews.filter((review) => reviewDayKey(review) === todayKey).length;

  const openCurrentRound = () => {
    const dayKey = localDayKey();
    const active = snapshot.activeRound?.dayKey === dayKey && snapshot.activeRound.language === snapshot.settings.activeLanguage ? snapshot.activeRound : undefined;
    if (active) {
      const selected = active.vocabularyIds.map((id) => words.find((word) => word.id === id)).filter((word): word is VocabularyItem => Boolean(word));
      if (selected.length) { setSession({ words: selected, nonce: Date.now() }); return; }
    }
    createNewRound();
  };
  const createNewRound = () => {
    const dayKey = localDayKey();
    const roundNumber = snapshot.activeRound?.dayKey === dayKey ? snapshot.activeRound.roundNumber + 1 : 1;
    const selected = buildDailyRound(snapshot, words, roundNumber);
    setSnapshot({ ...snapshot, activeRound: { dayKey, language: snapshot.settings.activeLanguage, vocabularyIds: selected.map((word) => word.id), roundNumber } });
    setSession({ words: selected, nonce: Date.now() });
  };
  const saveWord = (item: VocabularyItem) => setSnapshot((current) => {
    if (!current) return current;
    const vocabulary = current.vocabulary.some((word) => word.id === item.id) ? current.vocabulary.map((word) => word.id === item.id ? item : word) : [item, ...current.vocabulary];
    const refreshed = grammarExercisesForVocabulary(item);
    const storedById = new Map(current.grammarExercises.map((exercise) => [exercise.id, exercise]));
    return { ...current, vocabulary, grammarExercises: [...current.grammarExercises.filter((exercise) => exercise.vocabularyId !== item.id), ...refreshed.map((exercise) => ({ ...exercise, card: storedById.get(exercise.id)?.card ?? exercise.card }))] };
  });
  const deleteWord = (id: string) => { if (!window.confirm('Diese Vokabel wirklich löschen?')) return; setSnapshot((current) => current && ({ ...current, vocabulary: current.vocabulary.filter((word) => word.id !== id), grammarExercises: current.grammarExercises.filter((exercise) => exercise.vocabularyId !== id) })); setEditing(null); setSelectedWord(null); };
  const addReview = (item: VocabularyItem, grade: Grade) => setSnapshot((current) => {
    if (!current) return current;
    const now = new Date();
    const dayKey = localDayKey(now);
    const firstReviewToday = !current.reviews.some((review) => review.vocabularyId === item.id && reviewDayKey(review) === dayKey);
    return {
      ...current,
      vocabulary: current.vocabulary.map((word) => word.id === item.id ? { ...word, card: firstReviewToday ? schedule(word.card, grade, now) : word.card, updatedAt: now.toISOString() } : word),
      reviews: [...current.reviews, { id: crypto.randomUUID(), vocabularyId: item.id, rating: grade, reviewedAt: now.toISOString(), dayKey, roundNumber: current.activeRound?.roundNumber, wasNew: firstReviewToday && item.card.reps === 0 }],
    };
  });
  const addGrammarReview = (exercise: GrammarExercise, grade: Grade) => setSnapshot((current) => {
    if (!current) return current;
    const now = new Date();
    const firstReviewToday = !current.grammarReviews.some((review) => review.exerciseId === exercise.id && localDayKey(new Date(review.reviewedAt)) === localDayKey(now));
    return {
      ...current,
      grammarExercises: current.grammarExercises.map((item) => item.id === exercise.id ? { ...item, card: firstReviewToday ? schedule(item.card, grade, now) : item.card } : item),
      grammarReviews: [...current.grammarReviews, { id: crypto.randomUUID(), exerciseId: exercise.id, rating: grade, reviewedAt: now.toISOString() }],
    };
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 lg:grid-cols-[240px_1fr]">
        <aside className="hidden border-r border-border/80 bg-card/55 px-5 py-6 backdrop-blur lg:flex lg:flex-col">
          <button onClick={() => setView('today')} className="flex items-center gap-3 px-2 text-left"><span className="grid size-10 place-items-center rounded-2xl bg-primary text-lg font-bold text-white">7</span><span><strong className="block font-heading text-xl leading-none">Sema 7</strong><span className="text-xs text-muted-foreground">Mein Sprachweg</span></span></button>
          <nav className="mt-12 space-y-1" aria-label="Hauptnavigation"><SideNav active={view === 'today'} icon={Sparkles} label="Heute" onClick={() => setView('today')} /><SideNav active={view === 'words'} icon={Library} label="Meine Wörter" onClick={() => setView('words')} /><SideNav active={view === 'grammar'} icon={BookOpenCheck} label="Grammatik" onClick={() => setView('grammar')} /><SideNav active={view === 'progress'} icon={CalendarDays} label="Mein Profil" onClick={() => setView('progress')} /><SideNav active={view === 'settings'} icon={Settings2} label="Einstellungen" onClick={() => setView('settings')} /></nav>
          <div className="mt-auto rounded-2xl border border-primary/15 bg-primary/6 p-4"><div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Languages className="size-4 text-primary" /> Nächste Sprache</div><p className="text-xs leading-relaxed text-muted-foreground">Spanisch ist im Datenmodell bereits vorbereitet.</p></div>
        </aside>
        <section className="px-4 pb-28 pt-5 sm:px-8 lg:px-12 lg:pb-12 lg:pt-8">
          <header className="mx-auto flex max-w-6xl items-center justify-between"><div><p className="text-xs capitalize text-muted-foreground lg:text-sm">{dateLabel()}</p><h1 className="font-heading text-2xl font-bold lg:text-3xl">{view === 'today' ? 'Karibu zurück' : view === 'words' ? 'Meine Wörter' : view === 'grammar' ? 'Grammatik & Sätze' : view === 'progress' ? 'Mein Sprachprofil' : 'Einstellungen'}</h1></div><Button variant="outline" className="rounded-xl" onClick={() => setEditing('new')}><Plus /><span className="hidden sm:inline">Wort hinzufügen</span></Button></header>
          {view === 'today' && <Today snapshot={snapshot} words={words} due={due} learned={learned} todayCount={todayCount} onStart={openCurrentRound} onNewRound={createNewRound} onDiagnostic={() => setDiagnostic(true)} onWords={() => setView('words')} />}
          {view === 'words' && <Words words={words} onSelect={setSelectedWord} />}
          {view === 'grammar' && <GrammarHub exercises={snapshot.grammarExercises} words={words} onStart={setGrammarSession} onWord={setSelectedWord} />}
          {view === 'progress' && <ProfileDashboard snapshot={snapshot} words={words} />}
          {view === 'settings' && <Settings snapshot={snapshot} onChange={setSnapshot} onToast={setToast} />}
        </section>
      </div>
      <nav className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 rounded-2xl border bg-card/95 p-2 shadow-xl backdrop-blur lg:hidden" aria-label="Mobile Navigation">{([['today', Sparkles, 'Heute'], ['words', Library, 'Wörter'], ['grammar', BookOpenCheck, 'Grammatik'], ['progress', CalendarDays, 'Profil'], ['settings', Settings2, 'Mehr']] as const).map(([key, Icon, label]) => <button key={key} className={`mobile-nav ${view === key ? 'mobile-nav-active' : ''}`} onClick={() => setView(key)}><Icon /><span>{label}</span></button>)}</nav>
      {selectedWord && <VocabularyDetail word={snapshot.vocabulary.find((word) => word.id === selectedWord.id) ?? selectedWord} exercises={snapshot.grammarExercises.filter((exercise) => exercise.vocabularyId === selectedWord.id)} onClose={() => setSelectedWord(null)} onEdit={() => { setEditing(selectedWord); setSelectedWord(null); }} onPractice={(items) => { setGrammarSession(items); setSelectedWord(null); }} />}
      {editing && <WordEditor item={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} onSave={(item) => { saveWord(item); setEditing(null); setToast('Vokabel gespeichert.'); }} onDelete={deleteWord} />}
      {session && <LearningSession key={session.nonce} words={session.words} roundNumber={snapshot.activeRound?.roundNumber ?? 1} onClose={() => setSession(null)} onReview={addReview} onRepeat={() => setSession({ ...session, nonce: Date.now() })} onNewRound={createNewRound} />}
      {grammarSession && grammarSession.length > 0 && <GrammarPractice exercises={grammarSession} onClose={() => setGrammarSession(null)} onReview={addGrammarReview} />}
      {diagnostic && <Diagnostic words={words} onClose={() => setDiagnostic(false)} onFinish={(results) => { setSnapshot((current) => current && ({ ...current, vocabulary: current.vocabulary.map((word) => results[word.id] ? { ...word, card: schedule(word.card, results[word.id]) } : word), settings: { ...current.settings, diagnosticDone: true } })); setDiagnostic(false); setToast('Einstufung gespeichert.'); }} />}
      {toast && <div role="status" className="fixed bottom-24 left-1/2 z-[80] -translate-x-1/2 rounded-xl bg-[#123f3a] px-4 py-3 text-sm font-medium text-white shadow-xl lg:bottom-8">{toast}</div>}
    </main>
  );
}

function SideNav({ active, icon: Icon, label, onClick }: { active: boolean; icon: typeof Sparkles; label: string; onClick: () => void }) { return <button className={`nav-item w-full ${active ? 'nav-item-active' : ''}`} onClick={onClick}><Icon />{label}</button>; }

function Today({ snapshot, words, due, learned, todayCount, onStart, onNewRound, onDiagnostic, onWords }: { snapshot: AppSnapshot; words: VocabularyItem[]; due: number; learned: number; todayCount: number; onStart: () => void; onNewRound: () => void; onDiagnostic: () => void; onWords: () => void }) {
  const focus = words.find((word) => word.target.includes('Ninakushukuru')) ?? words[0];
  const speak = () => { if (!focus || !('speechSynthesis' in window)) return; const speech = new SpeechSynthesisUtterance(focus.target); speech.lang = 'sw-TZ'; speech.rate = .82; speechSynthesis.cancel(); speechSynthesis.speak(speech); };
  return <>
    {!snapshot.settings.diagnosticDone && <button onClick={onDiagnostic} className="mx-auto mt-6 flex w-full max-w-6xl items-center gap-3 rounded-2xl border border-[#d5b06b]/40 bg-[#fff4d9] p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#efc16c]/30"><CircleAlert className="size-5 text-[#8b621a]" /></span><span className="flex-1"><strong className="block text-sm">Kurze Einstufung empfohlen</strong><span className="text-xs text-muted-foreground">Zeig Sema 7, was du schon kannst.</span></span><ArrowRight className="size-4" /></button>}
    <div className="mx-auto mt-6 grid max-w-6xl gap-6 xl:grid-cols-[1.35fr_.65fr]">
      <Card className="relative min-h-[430px] overflow-hidden border-0 bg-[linear-gradient(145deg,#123f3a_0%,#17665c_58%,#d6755c_145%)] text-white shadow-[0_28px_70px_rgba(20,66,61,.23)] ring-0"><div className="absolute right-[-70px] top-[-90px] size-72 rounded-full border-[42px] border-white/5" /><CardHeader className="relative p-6 sm:p-8"><div className="flex items-start justify-between"><div><p className="mb-3 text-xs font-semibold uppercase tracking-[.2em] text-white/65">Deine Runde heute{snapshot.activeRound?.dayKey === localDayKey() ? ` · Runde ${snapshot.activeRound.roundNumber}` : ''}</p><CardTitle className="font-heading text-4xl font-bold sm:text-5xl">7 kleine Schritte.<br />Ein echtes Gespräch.</CardTitle></div><span className="grid size-12 place-items-center rounded-2xl bg-white/12"><Flame className="text-[#ffd19e]" /></span></div></CardHeader><CardContent className="relative p-6 pt-0 sm:p-8 sm:pt-0"><div className="mb-7 grid grid-cols-3 gap-3"><div className="metric"><strong>{todayCount}</strong><span>Antworten heute</span></div><div className="metric"><strong>{words.length}</strong><span>im Wortschatz</span></div><div className="metric"><strong>{learned}</strong><span>sicher gelernt</span></div></div><div className="mb-3 flex justify-between text-xs text-white/75"><span>{due} Karten langfristig fällig</span><span>{snapshot.activeRound?.vocabularyIds.length ?? 0} fest ausgewählt</span></div><Progress value={Math.min(100, todayCount / 35 * 100)} className="mb-7 [&_[data-slot=progress-track]]:bg-white/15 [&_[data-slot=progress-indicator]]:bg-[#ffc081]" /><div className="flex flex-col gap-2 sm:flex-row"><Button onClick={onStart} className="h-12 rounded-xl bg-[#ffd09d] text-[#173e39] hover:bg-[#ffe0bc]">{snapshot.activeRound?.dayKey === localDayKey() ? 'Runde wiederholen' : 'Erste Runde starten'} <ArrowRight /></Button><Button onClick={onNewRound} variant="outline" className="h-12 rounded-xl border-white/25 bg-white/5 text-white hover:bg-white/15 hover:text-white">Neue Runde</Button></div><p className="mt-3 text-xs text-white/60">Die sieben Karten bleiben fest, bis du ausdrücklich „Neue Runde“ wählst.</p></CardContent></Card>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">{focus && <Card className="border-0 bg-card shadow-lg ring-border/70"><CardHeader><div className="mb-4 flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-[#fff0e7] text-[#ba5b45]"><BookOpenText /></span><span className="rounded-full bg-muted px-3 py-1 text-xs">Aus deiner Liste</span></div><CardDescription>Wort des Tages</CardDescription><CardTitle className="font-heading text-3xl text-primary">{focus.target}</CardTitle></CardHeader><CardContent><p>{focus.translation}</p>{focus.morphemes && <div className="mt-4 flex gap-1.5">{focus.morphemes.map((part) => <span key={part} className="rounded-lg bg-muted px-2.5 py-1 font-mono text-xs">{part}</span>)}</div>}<Button variant="outline" className="mt-5 rounded-xl" onClick={speak}><Volume2 /> Aussprache</Button></CardContent></Card>}<Card className="border-0 bg-[#fbf2db] ring-[#e8d7ae]"><CardHeader><span className="mb-3 grid size-10 place-items-center rounded-xl bg-white/70 text-[#9b6c20]"><Mic2 /></span><CardTitle className="font-heading text-xl">Hören & nachsprechen</CardTitle><CardDescription>Gerätestimme, eigene Aufnahme oder hochgeladenes KI-Audio – lokal auf deinem Gerät.</CardDescription></CardHeader><CardContent className="flex gap-2 text-xs text-[#806c48]"><Headphones className="size-4" /> Im Vokabel-Editor verfügbar</CardContent></Card></div>
    </div>
    <section className="mx-auto mt-8 max-w-6xl"><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">Dein Fundament</p><h2 className="font-heading text-2xl font-bold">Als Nächstes</h2></div><Button variant="ghost" onClick={onWords}>Alle {words.length} ansehen <ArrowRight /></Button></div><div className="grid gap-3 md:grid-cols-3">{words.slice(0, 3).map((word) => <Card key={word.id} size="sm" className="border-0 bg-card ring-border/70"><CardContent className="flex items-center justify-between py-1"><div><strong className="block">{word.target}</strong><span className="text-sm text-muted-foreground">{word.translation}</span></div><span className="rounded-full bg-secondary px-2.5 py-1 text-xs">{word.card.reps ? 'Lernen' : 'Neu'}</span></CardContent></Card>)}</div></section>
  </>;
}

function Words({ words, onSelect }: { words: VocabularyItem[]; onSelect: (item: VocabularyItem) => void }) {
  const [query, setQuery] = useState(''); const [category, setCategory] = useState('Alle'); const categories = ['Alle', ...Array.from(new Set(words.map((word) => word.category))).sort()]; const shown = words.filter((word) => (category === 'Alle' || word.category === category) && `${word.target} ${word.translation}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="mx-auto mt-7 max-w-6xl"><div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]"><label className="relative"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input className="pl-9" placeholder="Swahili oder Deutsch suchen …" value={query} onChange={(event) => setQuery(event.target.value)} /></label><select className="h-9 rounded-xl border bg-card px-3 text-sm" value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((value) => <option key={value}>{value}</option>)}</select></div><p className="mb-3 text-sm text-muted-foreground">{shown.length} Vokabeln · Anklicken für Details und Übungen</p><div className="grid gap-3 md:grid-cols-2">{shown.map((word) => <button key={word.id} onClick={() => onSelect(word)} className="group rounded-2xl border bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"><div className="flex gap-3"><span className="grid size-10 place-items-center rounded-xl bg-primary/8 font-heading font-bold text-primary">{word.target[0]}</span><span className="flex-1"><span className="flex flex-wrap gap-2"><strong>{word.target}</strong>{word.verification && <span className={`rounded-full px-2 py-0.5 text-[10px] ${word.verification.status === 'verified' ? 'bg-primary/8 text-primary' : 'bg-[#fff0d5] text-[#885f1e]'}`}>{word.verification.status === 'verified' ? 'Geprüft' : word.verification.status === 'corrected' ? 'Korrigiert' : 'Hinweis'}</span>}</span><span className="block text-sm text-muted-foreground">{word.translation}</span><span className="mt-2 block text-[11px] text-primary">{word.category}{word.lemma ? ` · ${word.lemma}` : ''} · {word.card.reps ? `${word.card.reps}× geübt` : 'neu'}</span></span><ArrowRight className="size-4 text-muted-foreground" /></div></button>)}</div></div>;
}

function Settings({ snapshot, onChange, onToast }: { snapshot: AppSnapshot; onChange: (value: AppSnapshot) => void; onToast: (message: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null); const exportBackup = async () => { downloadJson(`sema-7-backup-${new Date().toISOString().slice(0, 10)}.json`, await createBackup(snapshot)); onToast('Vollständiges Backup erstellt.'); }; const importBackup = async (file?: File) => { if (!file) return; try { const next = await restoreBackup(JSON.parse(await file.text()) as BackupFile); onChange(next); onToast('Backup wiederhergestellt.'); } catch (error) { onToast(error instanceof Error ? error.message : 'Ungültiges Backup.'); } };
  return <div className="mx-auto mt-7 grid max-w-6xl gap-6 lg:grid-cols-2"><Card className="border-0 bg-card ring-border/70"><CardHeader><CardTitle className="font-heading text-2xl">Meine Lernroutine</CardTitle><CardDescription>Klein, regelmäßig und adaptiv.</CardDescription></CardHeader><CardContent className="space-y-5"><label className="block"><span className="mb-2 block text-sm font-medium">Karten pro Runde</span><select className="h-10 w-full rounded-xl border bg-background px-3" value={snapshot.settings.dailyGoal} onChange={(event) => onChange({ ...snapshot, settings: { ...snapshot.settings, dailyGoal: Number(event.target.value) } })}>{[5, 7, 10].map((value) => <option key={value} value={value}>{value}{value === 7 ? ' – empfohlen' : ''}</option>)}</select></label><label className="block"><span className="mb-2 block text-sm font-medium">Sprachziel</span><Input type="date" value={snapshot.settings.targetDate} onChange={(event) => onChange({ ...snapshot, settings: { ...snapshot.settings, targetDate: event.target.value } })} /></label><div className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">FSRS plant deine Wiederholungen. Die Daten bleiben auf deinem Gerät.</div></CardContent></Card><Card className="border-0 bg-card ring-border/70"><CardHeader><CardTitle className="font-heading text-2xl">Sichern & umziehen</CardTitle><CardDescription>Inklusive Lernstand, Bilder und Audios.</CardDescription></CardHeader><CardContent className="space-y-3"><Button className="w-full justify-start rounded-xl" variant="outline" onClick={exportBackup}><Download /> Backup exportieren</Button><Button className="w-full justify-start rounded-xl" variant="outline" onClick={() => fileRef.current?.click()}><Upload /> Backup wiederherstellen</Button><input ref={fileRef} hidden type="file" accept="application/json" onChange={(event) => importBackup(event.target.files?.[0])} /></CardContent></Card><Card className="overflow-hidden border-0 bg-[#123f3a] text-white ring-0 lg:col-span-2"><div className="grid md:grid-cols-[1fr_300px]"><CardContent className="p-6"><p className="text-xs uppercase tracking-[.18em] text-[#ffd09d]">Phase 2</p><h2 className="mt-2 font-heading text-3xl font-bold">Spanisch, gleiche Methode.</h2><p className="mt-3 text-sm text-white/70">Ein separates spanisches Deck lässt sich ergänzen, ohne deinen Swahili-Lernstand anzutasten.</p></CardContent><img src="/og.png" alt="Sema 7 – Mein persönlicher Sprachweg" className="h-full min-h-36 w-full object-cover opacity-85" /></div></Card></div>;
}

function Diagnostic({ words, onClose, onFinish }: { words: VocabularyItem[]; onClose: () => void; onFinish: (ratings: Record<string, Grade>) => void }) {
  const [index, setIndex] = useState(0); const [ratings, setRatings] = useState<Record<string, Grade>>({}); const word = words[index]; const choose = (grade: Grade) => { const next = { ...ratings, [word.id]: grade }; if (index + 1 === words.length) onFinish(next); else { setRatings(next); setIndex(index + 1); } };
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#082b28]/60 p-3 backdrop-blur-sm"><div className="w-full max-w-xl rounded-3xl bg-card p-6 shadow-2xl"><div className="flex justify-between"><div><p className="text-xs uppercase tracking-wider text-primary">Einstufung</p><h2 className="font-heading text-2xl font-bold">Was erkennst du schon?</h2></div><Button variant="ghost" onClick={onClose}>Schließen</Button></div><Progress className="mt-4" value={index / words.length * 100} /><p className="mt-2 text-xs text-muted-foreground">{index + 1} von {words.length}</p><h3 className="my-10 text-center font-heading text-4xl font-bold text-primary">{word.target}</h3><div className="grid gap-2 sm:grid-cols-3"><Button variant="outline" onClick={() => choose(1)}>Noch neu</Button><Button variant="outline" onClick={() => choose(2)}>Unsicher</Button><Button onClick={() => choose(4)}><Check /> Kann ich</Button></div></div></div>;
}
