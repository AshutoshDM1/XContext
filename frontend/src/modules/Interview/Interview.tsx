'use client';

import { useMemo, useState } from 'react';
import { useInterview } from '@/hooks/useInterviews';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import Section from '@/shared/Section/Section';
import Loader from '@/shared/Loader/Loader';
import ToolTopbar from '@/modules/Contest/components/ToolTopbar';

const Interview = ({ interviewId }: { interviewId: string }) => {
  const interviewIdNumber = useMemo(() => Number(interviewId), [interviewId]);
  const { data: interview, isLoading } = useInterview(interviewIdNumber, {
    enabled: Number.isFinite(interviewIdNumber) && interviewIdNumber > 0,
  });

  const [answerDraft, setAnswerDraft] = useState('');

  if (isLoading) {
    return (
      <Section className="py-6">
        <div className="flex min-h-[400px] flex-1 items-center justify-center">
          <Loader message="Loading interview..." />
        </div>
      </Section>
    );
  }

  if (!interview) {
    return (
      <Section className="py-6">
        <div className="text-foreground">Interview not found</div>
      </Section>
    );
  }

  return (
    <Section className="py-6">
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-none border bg-background">
        <ToolTopbar title={interview.title} description={interview.description} />

        <div className="min-h-0 flex-1">
          <ResizablePanelGroup
            orientation="horizontal"
            className="h-full min-h-[calc(100dvh-14rem)]"
          >
            <ResizablePanel defaultSize={55} minSize={25} className="min-h-0">
              <div className="flex h-full min-h-0 flex-col">
                <div className="shrink-0 border-b px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">Questions</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {interview.questionAnswers?.length ?? 0} total
                      </p>
                    </div>
                    <div className="shrink-0 text-xs text-muted-foreground">
                      Status: {interview.status}
                    </div>
                  </div>
                </div>

                <ScrollArea className="min-h-0 flex-1">
                  <div className="space-y-3 px-4 py-4">
                    {interview.interviewProjects && interview.interviewProjects.length > 0 ? (
                      <div className="rounded-none border bg-background/60 p-4">
                        <div className="text-xs text-muted-foreground">
                          Problems in this interview
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {interview.interviewProjects.map((ip) => (
                            <span
                              key={ip.id}
                              className="inline-flex items-center rounded-none border bg-muted/40 px-2 py-1 text-xs text-foreground"
                            >
                              {ip.project.projectId} (latest submission #
                              {ip.latestCodeSubmission.sequence})
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {interview.questionAnswers && interview.questionAnswers.length > 0 ? (
                      interview.questionAnswers.map((qa) => (
                        <div key={qa.id} className="rounded-none border bg-background/60 p-4">
                          <div className="text-xs text-muted-foreground">
                            Question {qa.sequence}
                          </div>
                          <div className="mt-1 text-sm text-foreground">{qa.question}</div>
                          <div className="mt-3 border-t pt-3">
                            <div className="text-xs text-muted-foreground">Answer</div>
                            <div className="mt-1 text-sm text-foreground">
                              {qa.answer ? (
                                qa.answer
                              ) : (
                                <span className="text-muted-foreground">Not answered yet</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-none border border-dashed bg-muted/20 p-6 text-center">
                        <p className="text-sm font-medium text-foreground">No questions yet</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Click “Start question” to generate the first one.
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle className="w-1.5 bg-border" />

            <ResizablePanel defaultSize={45} minSize={25} className="min-h-0">
              <div className="flex h-full min-h-0 flex-col">
                <div className="shrink-0 border-b px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">Interview panel</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Dummy UI for now (start question + answer input)
                  </p>
                </div>

                <div className="min-h-0 flex-1 p-4">
                  <div className="flex h-full min-h-0 flex-col rounded-none border bg-muted/10">
                    <div className="shrink-0 border-b p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            Current question
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            This will show the AI-generated question.
                          </p>
                        </div>
                        <Button type="button" size="sm" className="h-8 rounded-none">
                          Start question
                        </Button>
                      </div>
                    </div>

                    <div className="min-h-0 flex-1 p-4">
                      <div className="h-full rounded-none border border-dashed bg-background/40 p-4">
                        <p className="text-xs text-muted-foreground">Question area</p>
                        <p className="mt-2 text-sm text-foreground">
                          Once wired, this will display the generated prompt based on contest,
                          problem, and code submission.
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 border-t p-4">
                      <div className="grid gap-2">
                        <Textarea
                          value={answerDraft}
                          onChange={(e) => setAnswerDraft(e.target.value)}
                          placeholder="Type your answer..."
                          className="min-h-24 resize-none"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-none"
                            onClick={() => setAnswerDraft('')}
                          >
                            Clear
                          </Button>
                          <Button type="button" size="sm" className="h-8 rounded-none" disabled>
                            Send
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </main>
    </Section>
  );
};

export default Interview;
