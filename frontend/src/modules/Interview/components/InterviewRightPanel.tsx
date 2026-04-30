'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import InterviewMarkdown from './InterviewMarkdown';
import type { InterviewQuestionAnswer } from '@/services/interviews.service';
import { ScrollArea } from '@/components/ui/scroll-area';

type Props = {
  questionsCount: number;
  totalQuestions: number;
  currentQuestion: InterviewQuestionAnswer | null;
  answerDraft: string;
  setAnswerDraft: (v: string) => void;
  canGenerateNext: boolean;
  isGenerating: boolean;
  onGenerateNext: () => Promise<void>;
  canAnswer: boolean;
  isSavingAnswer: boolean;
  onSendAnswer: () => Promise<void>;
  onClear: () => void;
  ended: boolean;
};

export default function InterviewRightPanel({
  questionsCount,
  totalQuestions,
  currentQuestion,
  answerDraft,
  setAnswerDraft,
  canGenerateNext,
  isGenerating,
  onGenerateNext,
  canAnswer,
  isSavingAnswer,
  onSendAnswer,
  onClear,
  ended,
}: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">Interview</p>
          <Button
            type="button"
            size="sm"
            className="h-8 rounded-none"
            disabled={!canGenerateNext}
            onClick={onGenerateNext}
          >
            {isGenerating
              ? 'Generating…'
              : questionsCount === 0
                ? 'Start question'
                : questionsCount >= totalQuestions
                  ? 'Done'
                  : 'Next question'}
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 p-4">
        <div className="flex h-full min-h-0 flex-col rounded-none border border-dashed bg-background/40">
          <div className="shrink-0 border-b px-4 py-3">
            <p className="text-xs text-muted-foreground">
              {currentQuestion
                ? `Current question (Q${currentQuestion.sequence})`
                : 'Current question'}
            </p>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="px-4 py-3 text-foreground">
              {currentQuestion ? (
                <InterviewMarkdown markdown={currentQuestion.question} />
              ) : (
                <p className="text-sm text-foreground">Click “Start question” to begin.</p>
              )}

              {ended ? (
                <p className="mt-4 text-xs text-muted-foreground">
                  Interview ended. You can review the questions and answers on the left.
                </p>
              ) : null}
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="shrink-0 border-t p-4">
        <div className="grid gap-2">
          <Textarea
            value={answerDraft}
            onChange={(e) => setAnswerDraft(e.target.value)}
            placeholder="Type your answer..."
            className="min-h-24 resize-none"
            disabled={!canAnswer}
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-none"
              onClick={onClear}
              disabled={!canAnswer || answerDraft.length === 0}
            >
              Clear
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 rounded-none"
              disabled={!canAnswer || answerDraft.trim().length === 0}
              onClick={onSendAnswer}
            >
              {isSavingAnswer ? 'Saving…' : 'Send'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
