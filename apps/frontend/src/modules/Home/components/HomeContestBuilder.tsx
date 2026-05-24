'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ArrowRightIcon, SparkleIcon } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { MCQPicker, type MCQOption } from './MCQPicker';
import { useAiContest } from '@/hooks/use-ai-contest';

type Difficulty = 'light' | 'medium' | 'very_difficult';
type Length = 'short' | 'lengthy';
type BackendLogic = 'no' | 'yes';
type Language = 'typescript' | 'javascript';

const LANGUAGE_OPTIONS: MCQOption[] = [
  {
    id: 'typescript',
    label: 'TypeScript',
    description: 'Preferred (better types, clearer intent)',
  },
  { id: 'javascript', label: 'JavaScript', description: 'No types, focus on runtime behavior' },
];

const DIFFICULTY_OPTIONS: MCQOption[] = [
  { id: 'light', label: 'Light', description: 'Warm-up, fundamentals, minimal traps' },
  { id: 'medium', label: 'Medium', description: 'Real-world nuance, a few edge cases' },
  {
    id: 'very_difficult',
    label: 'Very difficult',
    description: 'Deep concepts, tricky constraints',
  },
];

const LENGTH_OPTIONS: MCQOption[] = [
  { id: 'short', label: 'Short', description: '10–20 minutes' },
  { id: 'lengthy', label: 'Lengthy', description: '30–60 minutes' },
];

const BACKEND_LOGIC_OPTIONS: MCQOption[] = [
  { id: 'no', label: 'Normal code', description: 'Single-file / small module, no routes' },
  { id: 'yes', label: 'Backend logic', description: 'Include routes / handlers / data flow' },
];

const TOPIC_OPTIONS: MCQOption[] = [
  { id: 'async-await', label: 'Async/Await', description: 'Concurrency, errors, cancellation' },
  { id: 'promises', label: 'Promises', description: 'Chaining, Promise.all, race, any' },
  { id: 'closures', label: 'Closures', description: 'Scopes, memoization, factories' },
  { id: 'generics', label: 'Generics', description: 'Type inference, constraints, utility types' },
  {
    id: 'type-guards',
    label: 'Type guards',
    description: 'Narrowing, predicates, discriminated unions',
  },
  { id: 'modules', label: 'Modules', description: 'ESM/CJS, imports, boundaries' },
];

export function HomeContestBuilder() {
  const router = useRouter();
  const [about, setAbout] = useState('');
  const [language, setLanguage] = useState<Language | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [length, setLength] = useState<Length | null>(null);
  const [backendLogic, setBackendLogic] = useState<BackendLogic | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const { mutateAsync, isPending } = useAiContest();

  const isReady = useMemo(() => {
    return (
      about.trim().length > 0 &&
      Boolean(language) &&
      Boolean(difficulty) &&
      Boolean(length) &&
      Boolean(backendLogic) &&
      topics.length > 0
    );
  }, [about, language, difficulty, length, backendLogic, topics.length]);

  const submit = async () => {
    if (!about.trim()) return toast.error('Tell me what you know / what you want to practice.');
    if (!language) return toast.error('Pick a language.');
    if (!difficulty) return toast.error('Pick a difficulty.');
    if (!length) return toast.error('Pick question length.');
    if (!backendLogic) return toast.error('Pick whether backend logic is included.');
    if (topics.length === 0) return toast.error('Pick at least one topic.');

    try {
      const { contestId } = await mutateAsync({
        about,
        language,
        difficulty,
        length,
        backendLogic,
        topics,
      });
      router.push(`/contests/${contestId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to generate contest');
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4">
      <Card className="border-border/80 bg-card/80 shadow-sm ring-1 ring-white/5 dark:bg-[#141414] dark:ring-white/6">
        <CardHeader className="gap-2">
          <CardTitle className="text-base">Create a private contest from your goals</CardTitle>
          <CardDescription>
            Answer a few quick multiple-choice questions so the AI can generate a high-quality
            problem that matches your stack.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-xs font-medium text-foreground">
              What do you know, and what do you want to practice?
            </div>
            <Textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Example: I know React + TS. I want to practice async patterns and building a clean API client. Prefer realistic constraints."
              rows={4}
              className="bg-transparent"
            />
          </div>

          <Separator className="opacity-60" />

          <MCQPicker
            title="Language"
            description="We only support a small set right now — pick one."
            options={LANGUAGE_OPTIONS}
            value={language ? [language] : []}
            onChange={(v) => setLanguage((v[0] as Language | undefined) ?? null)}
          />

          <MCQPicker
            title="Difficulty"
            options={DIFFICULTY_OPTIONS}
            value={difficulty ? [difficulty] : []}
            onChange={(v) => setDifficulty((v[0] as Difficulty | undefined) ?? null)}
          />

          <MCQPicker
            title="Question length"
            options={LENGTH_OPTIONS}
            value={length ? [length] : []}
            onChange={(v) => setLength((v[0] as Length | undefined) ?? null)}
          />

          <MCQPicker
            title="Should it include backend logic?"
            options={BACKEND_LOGIC_OPTIONS}
            value={backendLogic ? [backendLogic] : []}
            onChange={(v) => setBackendLogic((v[0] as BackendLogic | undefined) ?? null)}
          />

          <MCQPicker
            title="Topics (choose one or more)"
            description="Pick the areas you want the problem to focus on."
            options={TOPIC_OPTIONS}
            value={topics}
            onChange={setTopics}
            multiple
          />
        </CardContent>

        <CardFooter className="justify-between gap-2">
          <div className={cn('inline-flex items-center gap-2 text-xs text-muted-foreground')}>
            <SparkleIcon className="size-4 opacity-70" />
            We’ll generate a private contest + problem and redirect you.
          </div>
          <Button
            type="button"
            className="gap-1.5"
            onClick={submit}
            disabled={!isReady || isPending}
          >
            {isPending ? 'Generating…' : 'Generate contest'}
            <ArrowRightIcon weight="bold" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
