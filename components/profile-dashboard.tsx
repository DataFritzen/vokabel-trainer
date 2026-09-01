'use client';

import { BookOpenCheck, CalendarCheck2, Check, CircleDashed, Ear, MapPin, MessageCircle, ShieldCheck, Sparkles, Target, Waves } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { learningPacks } from '@/lib/curriculum';
import { learningStage, type LearningStage } from '@/lib/learning-status';
import { isDue } from '@/lib/scheduler';
import { wordMastery } from '@/lib/vocabulary-training';
import type { AppSnapshot, VocabularyItem } from '@/lib/types';

function dayKey(value: Date) {
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

function estimatedLevel(score: number) {
  if (score < 12) return { label: 'A1 · Start', next: 'Grundlagen aufbauen' };
  if (score < 32) return { label: 'A1 · im Aufbau', next: 'A1 festigen' };
  if (score < 58) return { label: 'A1+', next: 'A2 freischalten' };
  if (score < 78) return { label: 'A2 · im Aufbau', next: 'A2 festigen' };
  return { label: 'A2+', next: 'B1-Prüfpfad starten' };
}

export function ProfileDashboard({ snapshot, words }: { snapshot: AppSnapshot; words: VocabularyItem[] }) {
  const stages = words.reduce<Record<LearningStage, number>>((counts, word) => { counts[learningStage(word)] += 1; return counts; }, { new: 0, learning: 0, stable: 0, safe: 0 });
  const vocabScore = words.length ? Math.round(words.reduce((sum, word) => sum + wordMastery(word).overall, 0) / words.length) : 0;
  const activeIds = new Set(words.map((word) => word.id));
  const activeExercises = snapshot.grammarExercises.filter((exercise) => !exercise.vocabularyId || activeIds.has(exercise.vocabularyId));
  const practicedGrammar = activeExercises.filter((exercise) => exercise.card.reps > 0).length;
  const grammarScore = activeExercises.length ? Math.round(practicedGrammar / activeExercises.length * 100) : 0;
  const recentKeys = new Set(Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - index); return dayKey(date); }));
  const activeDays = new Set(snapshot.reviews.map((review) => dayKey(new Date(review.reviewedAt))).filter((key) => recentKeys.has(key))).size;
  const routineScore = Math.round(activeDays / 7 * 100);
  const score = Math.min(86, Math.round(vocabScore * .45 + grammarScore * .35 + routineScore * .2));
  const level = estimatedLevel(score);
  const due = words.filter((word) => isDue(word.card)).length;
  const firstPack = learningPacks[0];
  const packWords = snapshot.vocabulary.filter((word) => firstPack.vocabularyIds.includes(word.id) && word.learningStatus !== 'archived');
  const packPracticed = packWords.filter((word) => word.card.reps > 0).length;

  return <div className="mx-auto mt-7 max-w-6xl space-y-6">
    <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
      <Card className="overflow-hidden border-0 bg-[linear-gradient(145deg,#123f3a_0%,#17665c_62%,#d6755c_145%)] text-white ring-0"><CardContent className="grid min-h-[330px] gap-7 p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:p-8">
        <div className="relative mx-auto grid size-44 place-items-center rounded-full p-3 shadow-2xl" style={{ background: `conic-gradient(#ffd09d ${score * 3.6}deg, rgba(255,255,255,.13) 0deg)` }}><div className="grid size-full place-items-center rounded-full bg-[#12463f] text-center"><div><span className="text-xs uppercase tracking-[.18em] text-white/55">Lernstand</span><strong className="mt-1 block font-heading text-4xl">{score}%</strong><span className="text-xs text-[#ffd09d]">zum B1-Pfad</span></div></div></div>
        <div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-white/10 px-3 py-1 text-xs">App-Schätzung</span><span className="rounded-full bg-[#ffd09d] px-3 py-1 text-xs font-bold text-[#123f3a]">Ziel {snapshot.settings.targetLevel}</span></div><h2 className="mt-4 font-heading text-4xl font-bold">{level.label}</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">Dein Status basiert aktuell auf Vokabeln, Grammatik und Lernroutine. Hören und freies Sprechen werden erst eingerechnet, sobald echte Kompetenztests dafür vorhanden sind.</p><div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm"><span className="flex items-center gap-2"><Check className="size-4 text-[#ffd09d]" /> {stages.safe}/{words.length} sicher abrufbar</span><span className="flex items-center gap-2"><CalendarCheck2 className="size-4 text-[#ffd09d]" /> {activeDays}/7 aktive Tage</span><span className="flex items-center gap-2"><CircleDashed className="size-4 text-[#ffd09d]" /> {due} Karten fällig</span></div><p className="mt-5 text-xs text-white/55">Nächster Meilenstein: {level.next}</p></div>
      </CardContent></Card>

      <Card className="border-0 bg-[#fbf2db] ring-[#e8d7ae]"><CardHeader><div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-2xl bg-white/70 text-[#9b6c20]"><MapPin /></span><span className="rounded-full bg-[#1b665c] px-3 py-1 text-xs font-semibold text-white">Fokus aktiv</span></div><CardDescription>Deine regionale Lernspur</CardDescription><CardTitle className="font-heading text-3xl">Paje & Michamvi</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-[#6d6047]">Südost-Unguja wird für Alltag, Hörverstehen, Jugendgebrauch und Kultur priorisiert. Standard-Swahili bleibt die sichere aktive Sprache.</p><div className="mt-5 space-y-3"><RegionalRow icon={Waves} title="Kipaje & Südost-Unguja" status="priorisiert" /><RegionalRow icon={MessageCircle} title="Lokaler Alltag & Jugendgebrauch" status="verstehen zuerst" /><RegionalRow icon={ShieldCheck} title="Kultur & angemessener Ton" status="fest im Lernplan" /></div><div className="mt-5 rounded-xl bg-white/60 p-3 text-xs leading-relaxed text-[#756747]">Regionale Formen werden nur mit Herkunft und Gebrauchshinweis gezeigt – niemals ungeprüft als allgemeines Swahili.</div></CardContent></Card>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><SkillCard icon={Sparkles} title="Wortschatz" value={vocabScore} detail={`${stages.learning} im Lernen · ${stages.stable} stabil · ${stages.safe} sicher`} /><SkillCard icon={BookOpenCheck} title="Grammatik" value={grammarScore} detail={`${practicedGrammar} Aufgaben begonnen`} /><SkillCard icon={CalendarCheck2} title="Lernroutine" value={routineScore} detail={`${activeDays} von 7 Tagen`} /><SkillCard icon={Ear} title="Hören & Sprechen" value={0} detail="noch nicht geprüft" pending /></section>

    <Card className="border-0 bg-card ring-border/70"><CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><div><CardDescription>A1 · Lerneinheit 1</CardDescription><CardTitle className="font-heading text-2xl">{firstPack.title}</CardTitle></div><span className="rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">{packPracticed}/{packWords.length} begonnen</span></div></CardHeader><CardContent><Progress value={packWords.length ? packPracticed / packWords.length * 100 : 0} /><div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4"><StageBadge label="Neu" value={stages.new} /><StageBadge label="Im Lernen" value={stages.learning} /><StageBadge label="Stabil" value={stages.stable} /><StageBadge label="Sicher" value={stages.safe} /></div><p className="mt-4 text-xs leading-relaxed text-muted-foreground">„Stabil“ bedeutet: mehrfach an verschiedenen Tagen richtig. „Sicher“ wird erst nach weiteren erfolgreichen Wiederholungen und mindestens etwa 14 Tagen berechneter Gedächtnisstabilität vergeben.</p></CardContent></Card>

    <section className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
      <Card className="border-0 bg-card ring-border/70"><CardHeader><CardDescription>Dein GER-Ziel</CardDescription><CardTitle className="font-heading text-2xl">Der Weg zu B1</CardTitle></CardHeader><CardContent><div className="relative space-y-5 before:absolute before:bottom-4 before:left-[17px] before:top-4 before:w-px before:bg-border"><LevelStep label="A1" title="Alltag beginnen" active /><LevelStep label="A2" title="Routinen selbstständig bewältigen" /><LevelStep label="B1" title="Spontan sprechen und begründen" target /></div></CardContent></Card>
      <Card className="border-0 bg-card ring-border/70"><CardHeader><CardDescription>Status nach Teilkompetenz</CardDescription><CardTitle className="font-heading text-2xl">Was die App schon wirklich messen kann</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2"><Evidence title="Erkennen & Wortbedeutung" text="Wird aus deinen Vokabelantworten berechnet." ready /><Evidence title="Grammatische Formen" text="Wird separat über die Grammatikaufgaben geplant." ready /><Evidence title="Freies Sprechen" text="Benötigt künftig Aufgaben mit Aufnahme und Bewertung." /><Evidence title="Lokales Hörverstehen" text="Benötigt geprüfte Aufnahmen aus Paje und Michamvi." /></CardContent></Card>
    </section>
  </div>;
}

function SkillCard({ icon: Icon, title, value, detail, pending = false }: { icon: typeof Sparkles; title: string; value: number; detail: string; pending?: boolean }) { return <Card className="border-0 bg-card ring-border/70"><CardContent className="p-5"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-primary/8"><Icon className="size-5 text-primary" /></span><strong className="font-heading text-2xl text-primary">{pending ? '–' : `${value}%`}</strong></div><h3 className="mt-4 font-semibold">{title}</h3><Progress className="mt-2" value={value} /><p className="mt-2 text-xs text-muted-foreground">{detail}</p></CardContent></Card>; }
function StageBadge({ label, value }: { label: string; value: number }) { return <div className="rounded-xl bg-muted p-3"><strong className="block font-heading text-xl text-primary">{value}</strong><span className="text-muted-foreground">{label}</span></div>; }
function RegionalRow({ icon: Icon, title, status }: { icon: typeof Waves; title: string; status: string }) { return <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-white/70"><Icon className="size-4 text-[#8f671f]" /></span><span className="flex-1 text-sm font-medium">{title}</span><span className="text-[10px] font-semibold uppercase tracking-wide text-[#8f671f]">{status}</span></div>; }
function LevelStep({ label, title, active, target }: { label: string; title: string; active?: boolean; target?: boolean }) { return <div className="relative flex items-center gap-4"><span className={`z-10 grid size-9 place-items-center rounded-full text-xs font-bold ${active ? 'bg-primary text-white' : target ? 'bg-[#d6755c] text-white' : 'border bg-card text-muted-foreground'}`}>{label}</span><div><strong className="text-sm">{title}</strong><span className="block text-xs text-muted-foreground">{active ? 'jetzt im Aufbau' : target ? 'dein Ziel bis Dezember' : 'nächste Kernstufe'}</span></div></div>; }
function Evidence({ title, text, ready = false }: { title: string; text: string; ready?: boolean }) { return <div className="rounded-2xl border p-4"><span className={`mb-3 grid size-8 place-items-center rounded-full ${ready ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{ready ? <Check className="size-4" /> : <Target className="size-4" />}</span><strong className="block text-sm">{title}</strong><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p></div>; }
