/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  ArrowRightIcon,
  CaretDownIcon,
  ChatCircleIcon,
  LinkSimpleIcon,
  PlusIcon,
  SparkleIcon,
} from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { MCQPicker } from './MCQPicker';
import { useAiContestNext, useAiContestPreview } from '@/hooks/use-ai-contest';
import {
  CreateContestDialog,
  type CreateContestDialogInitialValues,
} from '@/modules/Contests/components/CreateContestDialog';
import { useSession } from '@/lib/auth-client';
import PleaseLogin from './PleaseLogin';
import type {
  AiContestDraft,
  AiContestNextResponse,
  ChatMessage,
} from '@/services/ai-contest.service';

type PendingSelection = { kind: 'single' | 'multi'; values: string[] } | null;

function toChatMessages(history: ChatMessage[]) {
  return history.map((m, idx) => (
    <div
      key={idx}
      className={cn(
        'text-sm leading-relaxed',
        m.role === 'user' ? 'text-foreground' : 'text-foreground',
      )}
    >
      <span className="mr-2 text-xs text-muted-foreground">{m.role === 'user' ? 'You' : 'AI'}</span>
      <span className="whitespace-pre-wrap">{m.content}</span>
    </div>
  ));
}

export function HomeContestChat() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { data: session, isPending: isSessionPending } = useSession();
  const isLoggedIn = Boolean(session);

  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState<AiContestDraft>({});
  const [languagePref, setLanguagePref] = useState<'javascript' | 'typescript'>('typescript');
  const [current, setCurrent] = useState<AiContestNextResponse['question'] | null>(null);
  const [input, setInput] = useState('');
  const [pendingSelection, setPendingSelection] = useState<PendingSelection>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const { mutateAsync: nextStep, isPending: isThinking } = useAiContestNext();
  const { mutateAsync: previewContest, isPending: isPreviewing } = useAiContestPreview();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorInitialValues, setEditorInitialValues] =
    useState<CreateContestDialogInitialValues | null>(null);

  const canSend = useMemo(
    () => input.trim().length > 0 && !isThinking && !editorOpen,
    [input, isThinking, editorOpen],
  );

  const hasUserMessage = useMemo(() => history.some((m) => m.role === 'user'), [history]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const viewport = el.closest('[data-slot="scroll-area-viewport"]') as HTMLElement | null;
    const target = viewport ?? el;
    target.scrollTo({ top: target.scrollHeight, behavior: 'smooth' });
  }, [history.length, current?.kind]);

  const pushAssistant = (content: string) =>
    setHistory((h) => [...h, { role: 'assistant', content: content.trim() }]);
  const pushUser = (content: string) => setHistory((h) => [...h, { role: 'user', content }]);

  const runNext = async (extraUserMessage?: string) => {
    try {
      const messages: ChatMessage[] = extraUserMessage
        ? [...history, { role: 'user' as const, content: extraUserMessage }]
        : history;
      const res = await nextStep({ messages, draft });
      setDraft(res.draft ?? {});
      setCurrent(res.question);
      pushAssistant(res.assistantMessage);

      if (res.question.kind === 'confirm') {
        const fullDraft = (res.draft ?? {}) as AiContestDraft;
        try {
          const preview = await previewContest(fullDraft as any);
          setEditorInitialValues({
            title: preview.contest.title,
            shortDescription: preview.contest.shortDescription,
            topbarDescription: preview.contest.topbarDescription ?? '',
            status: 'LIVE',
            projects: [
              {
                projectId: preview.problem.projectId,
                problemMarkdown: preview.problem.problemMarkdown,
              },
            ],
          });
          setEditorOpen(true);
        } catch (e) {
          toast.error(e instanceof Error ? e.message : 'Failed to generate contest details');
        }
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to generate next step');
    }
  };

  const submitText = async () => {
    const text = input.trim();
    if (!text) return;

    if (!isSessionPending && !isLoggedIn) {
      setLoginOpen(true);
      return;
    }

    setInput('');
    pushUser(text);

    // If the current question expects "about", we can prefill draft optimistically.
    if (current?.kind === 'text' && current.id === 'about') {
      setDraft((d) => ({ ...d, about: text }));
    }

    // Ensure we send language preference in the very first request to AI.
    // (So the agent can skip asking language if already chosen.)
    if (!draft.language) {
      setDraft((d) => ({ ...d, language: languagePref }));
    }

    await runNext(text);
  };

  const submitSelection = async () => {
    if (!current) return;
    if (!pendingSelection || pendingSelection.values.length === 0) {
      toast.error('Pick at least one option.');
      return;
    }

    if (!isSessionPending && !isLoggedIn) {
      setLoginOpen(true);
      return;
    }

    const chosen = pendingSelection.values;
    const labelById =
      current.kind === 'single' || current.kind === 'multi'
        ? new Map(current.options.map((o) => [o.id, o.label] as const))
        : new Map<string, string>();

    const summary = chosen.map((id) => labelById.get(id) ?? id).join(', ');
    pushUser(summary);

    // Update draft deterministically based on the question id.
    setDraft((d) => {
      const base = { ...d };
      if (current.kind === 'single') {
        (base as any)[current.id] = chosen[0];
      }
      if (current.kind === 'multi') {
        (base as any)[current.id] = chosen;
      }
      return base;
    });

    setPendingSelection(null);
    await runNext(summary);
  };

  const renderComposer = (opts?: { rows?: number }) => {
    const rows = opts?.rows ?? (hasUserMessage ? 3 : 5);
    return (
      <div
        className={cn(
          'rounded-none overflow-hidden border border-border/80 bg-card/80 shadow-sm',
          'ring-1 ring-white/5 dark:bg-[#141414] dark:ring-white/6',
          hasUserMessage && 'shrink-0',
        )}
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submitText();
            }
          }}
          placeholder="Describe the contest you want…"
          rows={rows}
          disabled={
            editorOpen ||
            isPreviewing ||
            isThinking ||
            current?.kind === 'single' ||
            current?.kind === 'multi'
          }
          className={cn(
            'w-full resize-none bg-transparent px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground',
            'outline-none focus-visible:ring-0 disabled:opacity-60 border-0 pb-20',
          )}
        />

        <div className="flex flex-wrap items-center gap-2 border-t border-border/60 px-3 py-2.5">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="rounded-full border-border/80 bg-muted/40"
            disabled
          >
            <PlusIcon weight="bold" />
          </Button>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
            <ChatCircleIcon className="size-3.5" />
            Agent
          </span>
          <div className="flex-1" />
          <Select
            value={languagePref}
            onValueChange={(v) => {
              const next = v === 'javascript' ? 'javascript' : 'typescript';
              setLanguagePref(next);
              setDraft((d) => ({ ...d, language: next }));
            }}
            disabled={editorOpen || isPreviewing || isThinking}
          >
            <SelectTrigger className="h-7 w-auto rounded-full border border-border/80 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="icon"
            className="rounded-full"
            disabled={
              !canSend || isThinking || current?.kind === 'single' || current?.kind === 'multi'
            }
            onClick={submitText}
            aria-label="Send"
          >
            <ArrowRightIcon weight="bold" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <LinkSimpleIcon className="size-3.5 shrink-0 opacity-70" />
            AI agent will ask options when needed
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
    );
  };

  const renderInlineQuestion = () => {
    if (!current) return null;

    if (current.kind === 'text') {
      return <div className="text-xs text-muted-foreground">{current.prompt}</div>;
    }

    if (current.kind === 'confirm') {
      return (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">{current.prompt}</div>
          <div className="whitespace-pre-wrap rounded border border-border/60 bg-muted/20 px-3 py-2 text-xs text-foreground">
            {current.summary}
          </div>
          {isPreviewing ? (
            <div className="text-xs text-muted-foreground">Generating contest details…</div>
          ) : null}
        </div>
      );
    }

    if (current.kind === 'single' || current.kind === 'multi') {
      return (
        <div className="space-y-3">
          <MCQPicker
            title={current.prompt}
            options={current.options.map((o) => ({ id: o.id, label: o.label }))}
            value={pendingSelection?.values ?? []}
            onChange={(v) =>
              setPendingSelection({
                kind: current.kind,
                values: v.slice(0, current.kind === 'single' ? 1 : 6),
              })
            }
            multiple={current.kind === 'multi'}
          />
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={submitSelection} disabled={isThinking}>
              Confirm selection
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={cn(
        'mx-auto flex flex-1 flex-col justify-center w-full max-w-3xl gap-6 px-4',
        hasUserMessage ? 'min-h-[calc(100vh-10rem)]' : 'min-h-[calc(100vh-12rem)]',
      )}
    >
      <h1 className="shrink-0 text-center text-2xl font-medium tracking-tight text-foreground md:text-3xl">
        What should we ask you about?
      </h1>
      <p className="text-center text-sm text-muted-foreground">
        Tell me what you want to build a contest or problem to practice for. I’ll ask a few quick
        questions and generate it for you.
      </p>

      <div className="flex min-h-0 flex-col gap-4 pt-6">
        <ScrollArea className="h-0 min-h-0 flex-1 pr-3">
          <div ref={scrollRef} className="space-y-3 pr-2 pb-2">
            {toChatMessages(history)}
            {isThinking ? (
              <div className="text-xs text-muted-foreground">
                <span className="mr-2 mb-4">AI</span>
                <span className="inline-flex items-center gap-2 relative top-1">
                  <SparkleIcon className="size-4 opacity-70" />
                  Thinking…
                </span>
              </div>
            ) : null}
          </div>
        </ScrollArea>
        {renderInlineQuestion()}
        {renderComposer({ rows: 3 })}
      </div>

      <CreateContestDialog
        open={editorOpen}
        onOpenChange={(open) => {
          setEditorOpen(open);
          if (!open) setEditorInitialValues(null);
        }}
        initialValues={editorInitialValues}
        showTrigger={false}
        onCreated={(contestId) => {
          router.push(`/contests/${contestId}`);
        }}
      />

      <PleaseLogin
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={() => router.push('/login?redirect=/')}
      />
    </div>
  );
}
