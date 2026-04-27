'use client';

import {
  ArrowRightIcon,
  CaretDownIcon,
  ChatCircleIcon,
  LinkSimpleIcon,
  PlusIcon,
} from '@phosphor-icons/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAiQuestion } from '../../../hooks/use-ai-question';

const PRESETS = ['Closures', 'Generics', 'Async / await', 'Type guards', 'Modules'] as const;

export function QuestionTextArea() {
  const [topic, setTopic] = useState('');
  const { mutate, isPending, data, reset } = useAiQuestion();

  const submit = () => {
    const t = topic.trim();
    if (!t) {
      toast.error('Enter a JS or TypeScript topic first.');
      return;
    }
    mutate(t, {
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Something went wrong'),
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4">
      <h1 className="text-center text-2xl font-medium tracking-tight text-foreground md:text-3xl">
        What should we ask you about?
      </h1>

      <div
        className={cn(
          'rounded-2xl overflow-hidden border border-border/80 bg-card/80 shadow-sm',
          'ring-1 ring-white/5 dark:bg-[#141414] dark:ring-white/6',
        )}
      >
        <textarea
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            if (data) reset();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Type a JavaScript or TypeScript topic…"
          rows={5}
          disabled={isPending}
          className={cn(
            'w-full resize-none bg-transparent px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground',
            'outline-none focus-visible:ring-0 disabled:opacity-60',
          )}
        />

        <div className="flex flex-wrap items-center gap-2 border-t border-border/60 px-3 py-2.5">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="rounded-full border-border/80 bg-muted/40"
          >
            <PlusIcon weight="bold" />
          </Button>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
            <ChatCircleIcon className="size-3.5" />
            Topic
          </span>
          <span className="hidden rounded-full border border-border/80 bg-muted/20 px-3 py-1 text-xs text-muted-foreground sm:inline-flex">
            Plan
          </span>
          <div className="flex-1" />
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-muted/30 px-3 py-1 text-xs text-muted-foreground"
          >
            JS · TS
            <CaretDownIcon className="size-3.5 opacity-70" />
          </button>
          <Button
            type="button"
            size="icon"
            className="rounded-full"
            disabled={isPending}
            onClick={submit}
            aria-label="Generate question"
          >
            <ArrowRightIcon weight="bold" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <LinkSimpleIcon className="size-3.5 shrink-0 opacity-70" />
            AI-generated interview questions for your stack
          </span>
          <div className="flex items-center gap-1 opacity-80" aria-hidden>
            {['bg-red-500', 'bg-blue-500', 'bg-amber-500', 'bg-violet-500', 'bg-emerald-500'].map(
              (c) => (
                <span key={c} className={cn('size-2 rounded-full', c)} />
              ),
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {PRESETS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              setTopic(label);
              reset();
            }}
            className={cn(
              'rounded-full border border-border/80 bg-muted/50 cursor-pointer px-3 py-1.5 text-xs text-muted-foreground',
              'transition-colors hover:border-border hover:bg-muted/50 hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
        <span className="rounded-full border border-dashed border-border/60 px-3 py-1.5 text-xs text-muted-foreground">
          More
        </span>
      </div>

      {data?.question ? (
        <div className="rounded-xl border border-border/80 bg-muted/20 p-4 text-sm leading-relaxed text-foreground">
          {data.question}
        </div>
      ) : null}
    </div>
  );
}
