'use client';

import type { ComponentProps } from 'react';
import { CopyIcon } from '@phosphor-icons/react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export type CodeDocProps = {
  title: string;
  problemMarkdown: string;
};

const mdComponents = {
  h1: ({ className, ...props }: ComponentProps<'h1'>) => (
    <h1
      className={cn('mb-4 text-2xl font-semibold tracking-tight text-white', className)}
      {...props}
    />
  ),
  h2: ({ className, ...props }: ComponentProps<'h2'>) => (
    <h2
      className={cn('mb-3 mt-8 text-lg font-semibold text-white first:mt-0', className)}
      {...props}
    />
  ),
  p: ({ className, ...props }: ComponentProps<'p'>) => (
    <p className={cn('mb-3 text-sm leading-relaxed text-neutral-300', className)} {...props} />
  ),
  ul: ({ className, ...props }: ComponentProps<'ul'>) => (
    <ul
      className={cn('mb-3 list-disc space-y-2 pl-5 text-sm text-neutral-300', className)}
      {...props}
    />
  ),
  ol: ({ className, ...props }: ComponentProps<'ol'>) => (
    <ol
      className={cn('mb-3 list-decimal space-y-2 pl-5 text-sm text-neutral-300', className)}
      {...props}
    />
  ),
  li: ({ className, ...props }: ComponentProps<'li'>) => (
    <li className={cn('leading-relaxed', className)} {...props} />
  ),
  strong: ({ className, ...props }: ComponentProps<'strong'>) => (
    <strong className={cn('font-semibold text-white', className)} {...props} />
  ),
  code: ({ className, ...props }: ComponentProps<'code'>) => (
    <code
      className={cn(
        'rounded-none border border-white/15 bg-white/10 px-1.5 py-0.5 font-mono text-[0.8125rem] text-neutral-100',
        className,
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }: ComponentProps<'pre'>) => (
    <pre
      className={cn(
        'mb-3 overflow-x-auto border border-white/15 bg-neutral-950 p-3 font-mono text-xs text-neutral-200',
        className,
      )}
      {...props}
    />
  ),
};

const CodeDoc = ({ title, problemMarkdown }: CodeDocProps) => {
  const copyProblem = async () => {
    try {
      await navigator.clipboard.writeText(problemMarkdown);
      toast.success('Problem copied to clipboard');
    } catch {
      toast.error('Could not copy');
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-black text-white">
      <Tabs defaultValue="problem" className="flex min-h-0 flex-1 flex-col gap-0">
        <div className="shrink-0 border-b border-white/15 px-4 pt-3">
          <TabsList className="h-9 w-fit gap-0 rounded-none border border-white/15 bg-neutral-950 p-0">
            <TabsTrigger
              value="problem"
              className="rounded-none px-4 text-xs text-neutral-400 data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:bg-black data-[state=active]:text-white"
            >
              Problem
            </TabsTrigger>
            <TabsTrigger
              value="submissions"
              className="rounded-none px-4 text-xs text-neutral-400 data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:bg-black data-[state=active]:text-white"
            >
              Submissions
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="problem"
          className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
        >
          <div className="flex shrink-0 flex-col gap-3 border-b border-white/15 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 border-white/25 text-white hover:bg-white/10 hover:text-white"
              onClick={() => void copyProblem()}
            >
              <CopyIcon className="size-4" />
              Copy problem
            </Button>
          </div>
          <ScrollArea className="min-h-0 flex-1">
            <div className="px-4 py-6 pr-6">
              <ReactMarkdown components={mdComponents}>{problemMarkdown}</ReactMarkdown>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent
          value="submissions"
          className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
        >
          <ScrollArea className="min-h-0 flex-1">
            <div className="px-4 py-10 text-center text-sm text-neutral-500">
              No submissions yet
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CodeDoc;
