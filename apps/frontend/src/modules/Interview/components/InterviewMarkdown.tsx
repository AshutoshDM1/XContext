'use client';

import type { ComponentProps } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

const mdComponents = {
  h1: ({ className, ...props }: ComponentProps<'h1'>) => (
    <h1
      className={cn('mb-2 text-base font-semibold tracking-tight text-foreground', className)}
      {...props}
    />
  ),
  h2: ({ className, ...props }: ComponentProps<'h2'>) => (
    <h2
      className={cn('mb-2 mt-4 text-sm font-semibold text-foreground first:mt-0', className)}
      {...props}
    />
  ),
  h3: ({ className, ...props }: ComponentProps<'h3'>) => (
    <h3
      className={cn('mb-2 mt-3 text-sm font-semibold text-foreground first:mt-0', className)}
      {...props}
    />
  ),
  p: ({ className, ...props }: ComponentProps<'p'>) => (
    <p className={cn('mb-3 text-xs leading-relaxed text-muted-foreground', className)} {...props} />
  ),
  ul: ({ className, ...props }: ComponentProps<'ul'>) => (
    <ul
      className={cn('mb-3 list-disc space-y-2 pl-5 text-xs text-muted-foreground', className)}
      {...props}
    />
  ),
  ol: ({ className, ...props }: ComponentProps<'ol'>) => (
    <ol
      className={cn('mb-3 list-decimal space-y-2 pl-5 text-xs text-muted-foreground', className)}
      {...props}
    />
  ),
  li: ({ className, ...props }: ComponentProps<'li'>) => (
    <li className={cn('leading-relaxed text-xs', className)} {...props} />
  ),
  strong: ({ className, ...props }: ComponentProps<'strong'>) => (
    <strong className={cn('font-semibold text-xs text-foreground', className)} {...props} />
  ),
  code: ({ className, ...props }: ComponentProps<'code'>) => (
    <code
      className={cn(
        'rounded-none border bg-muted px-1.5 py-0.5 font-mono text-[0.8125rem] text-foreground',
        className,
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }: ComponentProps<'pre'>) => (
    <pre
      className={cn(
        'mb-3 overflow-x-auto border bg-muted p-3 font-mono text-xs text-foreground',
        className,
      )}
      {...props}
    />
  ),
};

export default function InterviewMarkdown({ markdown }: { markdown: string }) {
  return <ReactMarkdown components={mdComponents}>{markdown}</ReactMarkdown>;
}
