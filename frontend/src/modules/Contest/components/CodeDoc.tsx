'use client';

import { useState, useEffect, type ComponentProps } from 'react';
import { CopyIcon } from '@phosphor-icons/react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { Project } from '@/store/contests';
import { useContestContext } from '@/store/contestContext';
import { useCodeSubmissions } from '@/hooks/useCodeSubmissions';
import AiInterviewLauncher from './AiInterviewLauncher';

export type CodeDocProps = {
  title: string;
  projects: Project[];
  contestId: number;
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

const CodeDoc = ({ title, projects, contestId }: CodeDocProps) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.projectId || '');
  const setSelectedProblem = useContestContext((s) => s.setSelectedProblem);

  const selectedProject = projects.find((p) => p.projectId === selectedProjectId) || projects[0];
  const { data: submissions, isLoading: isSubmissionsLoading } = useCodeSubmissions({ contestId });

  // Update context when selected project changes
  useEffect(() => {
    if (selectedProjectId && contestId) {
      setSelectedProblem(selectedProjectId, contestId);
    }
  }, [selectedProjectId, contestId, setSelectedProblem]);

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
          <div className="flex items-center justify-between gap-3">
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

            <AiInterviewLauncher
              projects={projects}
              submissions={submissions}
              isLoadingSubmissions={isSubmissionsLoading}
            />
          </div>
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
            <div className="px-4 py-6">
              {isSubmissionsLoading ? (
                <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
              ) : submissions && submissions.length > 0 ? (
                <div className="space-y-3">
                  {submissions.map((s) => {
                    const idx = projects.findIndex((p) => p.id === s.projectId);
                    const label = idx >= 0 ? `Problem ${idx + 1}` : `Problem`;
                    return (
                      <div
                        key={s.id}
                        className="flex items-center justify-between gap-3 rounded-none border border-border bg-background/60 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground">
                            Submission #{s.sequence} of {label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(s.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="shrink-0 text-xs text-muted-foreground">
                          {s.projectName ? s.projectName : label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No submissions yet
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CodeDoc;
