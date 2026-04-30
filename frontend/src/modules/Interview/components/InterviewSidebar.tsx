'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { InterviewDetails } from '@/services/interviews.service';
import InterviewMarkdown from './InterviewMarkdown';

type Props = {
  interview: InterviewDetails;
  totalQuestions: number;
  timeLabel: string;
  showTimerNote: boolean;
};

export default function InterviewSidebar({
  interview,
  totalQuestions,
  timeLabel,
  showTimerNote,
}: Props) {
  const questions = interview.questionAnswers ?? [];
  const statusClass =
    interview.status === 'COMPLETED'
      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
      : interview.status === 'IN_PROGRESS'
        ? 'border-sky-500/40 bg-sky-500/10 text-sky-200'
        : 'border-muted-foreground/30 bg-muted/30 text-muted-foreground';

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              Questions: {questions.length}/{totalQuestions}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-xs text-muted-foreground">
              Time left {timeLabel}
              {showTimerNote ? ' • starts on first question' : ''}
            </p>
            <Badge variant="outline" className="shrink-0 h-[32px]">
              <span className={statusClass}>{interview.status}</span>
            </Badge>
          </div>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1 max-h-[calc(100dvh-17rem)]">
        <div className="space-y-3 px-4 py-4">
          {interview.interviewProjects && interview.interviewProjects.length > 0 ? (
            <div className="rounded-none border bg-background/60 p-4">
              <div className="text-xs text-muted-foreground">Problems</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {interview.interviewProjects.map((ip) => (
                  <span
                    key={ip.id}
                    className="inline-flex items-center rounded-none border bg-muted/40 px-2 py-1 text-xs text-foreground"
                  >
                    {ip.project.projectId} (latest submission #{ip.latestCodeSubmission.sequence})
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {questions.length > 0 ? (
            questions.map((qa) => (
              <details key={qa.id} className="group rounded-none border bg-background/60">
                <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3">
                  <div className="text-xs text-muted-foreground">Q{qa.sequence}</div>
                  <Badge
                    variant="outline"
                    className={
                      qa.answer
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                        : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                    }
                  >
                    {qa.answer ? 'Answered' : 'Pending'}
                  </Badge>
                </summary>
                <div className="px-4 pb-4">
                  <div className="text-foreground">
                    <InterviewMarkdown markdown={qa.question} />
                  </div>
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
              </details>
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
  );
}
