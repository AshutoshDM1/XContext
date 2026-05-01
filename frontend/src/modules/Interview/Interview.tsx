'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  useAnswerInterviewQuestion,
  useGenerateInterviewQuestion,
  useInterview,
  useUpdateInterview,
} from '@/hooks/useInterviews';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import Section from '@/shared/Section/Section';
import Loader from '@/shared/Loader/Loader';
import ToolTopbar from '@/modules/Contest/components/ToolTopbar';
import InterviewSidebar from './components/InterviewSidebar';
import InterviewRightPanel from './components/InterviewRightPanel';
import EndedDailog from './components/EndedDailog';

const Interview = ({ interviewId }: { interviewId: string }) => {
  const interviewIdNumber = useMemo(() => Number(interviewId), [interviewId]);
  const { data: interview, isLoading } = useInterview(interviewIdNumber, {
    enabled: Number.isFinite(interviewIdNumber) && interviewIdNumber > 0,
  });
  const { mutateAsync: generateQuestion, isPending: isGenerating } =
    useGenerateInterviewQuestion(interviewIdNumber);
  const { mutateAsync: saveAnswer, isPending: isSavingAnswer } =
    useAnswerInterviewQuestion(interviewIdNumber);
  const { mutate: updateInterview } = useUpdateInterview(interviewIdNumber);

  const [answerDraft, setAnswerDraft] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [dismissedEndedDialog, setDismissedEndedDialog] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const totalQuestions = 2;
  const questions = interview?.questionAnswers ?? [];
  const currentQuestion = questions.length > 0 ? questions[questions.length - 1] : null;
  const currentUnanswered = currentQuestion && !currentQuestion.answer ? currentQuestion : null;

  const startedAtMs = interview?.startedAt ? new Date(interview.startedAt).getTime() : null;
  const totalMs = 10 * 60 * 1000;
  const remainingMs = startedAtMs === null ? totalMs : Math.max(0, totalMs - (now - startedAtMs));
  const remainingSec = Math.floor(remainingMs / 1000);
  const mm = String(Math.floor(remainingSec / 60)).padStart(2, '0');
  const ss = String(remainingSec % 60).padStart(2, '0');
  const timeLabel = `${mm}:${ss}`;

  const canGenerateNext = remainingMs > 0 && questions.length < totalQuestions && !isGenerating;
  const canAnswer = remainingMs > 0 && !!currentUnanswered && !isSavingAnswer;
  const allAnswered = questions.length > 0 && questions.every((q) => !!q.answer);
  const ended =
    remainingMs === 0 ||
    (questions.length >= totalQuestions && allAnswered) ||
    interview?.status === 'COMPLETED';

  useEffect(() => {
    if (!interview) return;
    if (ended && interview.status !== 'COMPLETED') {
      updateInterview({ status: 'COMPLETED' });
    }
  }, [ended, interview, updateInterview]);

  const endedDialogOpen = Boolean(
    interview && interview.status === 'COMPLETED' && !dismissedEndedDialog,
  );

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
    <Section className="py-6 overflow-hidden">
      <main className="flex h-[calc(100dvh-9rem)] min-h-0 flex-1 flex-col overflow-hidden rounded-none border bg-background">
        <ToolTopbar title={interview.title} description={interview.description} />
        <EndedDailog
          open={endedDialogOpen}
          onOpenChange={setDismissedEndedDialog}
          onClose={() => setDismissedEndedDialog(true)}
        />
        <div className="min-h-0 flex-1 overflow-hidden">
          <ResizablePanelGroup orientation="horizontal" className="h-full">
            <ResizablePanel defaultSize={45} minSize={25} className="min-h-0 overflow-hidden">
              <InterviewSidebar
                interview={interview}
                totalQuestions={totalQuestions}
                timeLabel={timeLabel}
                showTimerNote={!startedAtMs}
              />
            </ResizablePanel>

            <ResizableHandle withHandle className="w-1.5 bg-border" />

            <ResizablePanel defaultSize={65} minSize={25} className="min-h-0 overflow-hidden">
              <InterviewRightPanel
                questionsCount={questions.length}
                totalQuestions={totalQuestions}
                currentQuestion={currentQuestion}
                answerDraft={answerDraft}
                setAnswerDraft={setAnswerDraft}
                canGenerateNext={canGenerateNext && !ended}
                isGenerating={isGenerating}
                onGenerateNext={async () => {
                  if (ended) return;
                  await generateQuestion();
                }}
                canAnswer={canAnswer && !ended}
                isSavingAnswer={isSavingAnswer}
                onSendAnswer={async () => {
                  if (!currentUnanswered || ended) return;
                  const trimmed = answerDraft.trim();
                  if (!trimmed) return;
                  await saveAnswer({ questionAnswerId: currentUnanswered.id, answer: trimmed });
                  setAnswerDraft('');
                }}
                onClear={() => setAnswerDraft('')}
                ended={ended}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </main>
    </Section>
  );
};

export default Interview;
