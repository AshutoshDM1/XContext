'use client';

import { useState, type ComponentProps } from 'react';
import { CopyIcon } from '@phosphor-icons/react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { Project } from '@/store/contests';

export type CodeDocProps = {
  title: string;
  projects: Project[];
};

const mdComponents = {
  h1: ({ className, ...props }: ComponentProps<'h1'>) => (
    <h1
      className={cn('mb-2 text-lg font-semibold tracking-tight text-foreground', className)}
      {...props}
    />
  ),
  h2: ({ className, ...props }: ComponentProps<'h2'>) => (
    <h2
      className={cn('mb-3 mt-4 text-base font-semibold text-foreground first:mt-0', className)}
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
    <strong className={cn('font-semibold text-xs', className)} {...props} />
  ),
  code: ({ className, ...props }: ComponentProps<'code'>) => (
    <code
      className={cn(
        'text-xs rounded-none border bg-muted px-1.5 py-0.5 font-mono text-[0.8125rem] text-foreground',
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

const CodeDoc = ({ title, projects }: CodeDocProps) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.projectId || '');

  const selectedProject = projects.find((p) => p.projectId === selectedProjectId) || projects[0];

  const copyProblem = async () => {
    try {
      await navigator.clipboard.writeText(selectedProject?.problemMarkdown || '');
      toast.success('Problem copied to clipboard');
    } catch {
      toast.error('Could not copy');
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground overflow-y-auto ">
      <Tabs
        value={selectedProjectId}
        onValueChange={setSelectedProjectId}
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        <div className="shrink-0 border-b px-4 pt-3">
          <TabsList className="h-9 w-fit gap-0 rounded-none border bg-muted p-0">
            {projects.map((project, index) => (
              <TabsTrigger
                key={project.projectId}
                value={project.projectId}
                className="rounded-none px-4 text-xs text-muted-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                Problem {index + 1}
              </TabsTrigger>
            ))}
            <TabsTrigger
              value="submissions"
              className="rounded-none px-4 text-xs text-muted-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              Submissions
            </TabsTrigger>
          </TabsList>
        </div>

        {projects.map((project) => (
          <TabsContent
            key={project.projectId}
            value={project.projectId}
            className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
          >
            <div className="flex shrink-0 flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => void copyProblem()}
              >
                <CopyIcon className="size-4" />
                Copy problem
              </Button>
            </div>
            <ScrollArea className="min-h-0 max-h-[calc(100dvh-20rem)] flex-1 overflow-auto">
              <div className="px-4 py-6 pr-6">
                <ReactMarkdown components={mdComponents}>{project.problemMarkdown}</ReactMarkdown>
              </div>
            </ScrollArea>
          </TabsContent>
        ))}

        <TabsContent
          value="submissions"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
        >
          <ScrollArea className="min-h-0 flex-1 overflow-auto">
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No submissions yet
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CodeDoc;
