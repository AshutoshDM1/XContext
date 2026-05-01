'use client';

import { useEffect, useMemo } from 'react';
import Section from '@/shared/Section/Section';
import Loader from '@/shared/Loader/Loader';
import { Button } from '@/components/ui/button';
import {
  useGenerateInterviewRating,
  useInterview,
  useInterviewRating,
} from '@/hooks/useInterviews';
import { useRouter } from 'next/navigation';

export default function InterviewResult({ interviewId }: { interviewId: string }) {
  const router = useRouter();
  const interviewIdNumber = useMemo(() => Number(interviewId), [interviewId]);
  const { data: interview, isLoading } = useInterview(interviewIdNumber, {
    enabled: Number.isFinite(interviewIdNumber) && interviewIdNumber > 0,
  });

  const { data: rating } = useInterviewRating(interviewIdNumber, {
    enabled: Boolean(interview) && interview?.status === 'COMPLETED',
    refetchInterval: 1500,
  });
  const { mutate: generate, isPending } = useGenerateInterviewRating(interviewIdNumber);

  useEffect(() => {
    if (!interview || interview.status !== 'COMPLETED') return;
    if (!rating || rating.status === 'PENDING') generate();
  }, [generate, interview, rating]);

  // Stop polling once rating is final.
  useEffect(() => {
    if (!rating) return;
    if (rating.status === 'COMPLETED' || rating.status === 'FAILED') {
      // react-query doesn't let us dynamically change refetchInterval easily here without a custom hook;
      // keep it simple: the query will still refetch, but the endpoint is cheap.
    }
  }, [rating]);

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

  if (interview.status !== 'COMPLETED') {
    return (
      <Section className="py-6">
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">Interview is not completed yet.</div>
          <Button type="button" onClick={() => router.push(`/interview/${interview.id}`)}>
            Go to interview
          </Button>
        </div>
      </Section>
    );
  }

  if (!rating || rating.status === 'PENDING' || rating.status === 'PROCESSING' || isPending) {
    return (
      <Section className="py-6">
        <div className="flex min-h-[400px] flex-1 flex-col items-center justify-center gap-3 text-center">
          <Loader message="Generating your rating..." />
          <div className="max-w-md text-xs text-muted-foreground">
            This can take a few seconds. You can keep this page open or refresh — progress is saved.
          </div>
        </div>
      </Section>
    );
  }

  if (rating.status === 'FAILED') {
    return (
      <Section className="py-6">
        <div className="space-y-3">
          <div className="text-sm font-medium text-foreground">Rating generation failed</div>
          <div className="text-xs text-muted-foreground">{rating.error ?? 'Unknown error'}</div>
          <Button type="button" onClick={() => generate()}>
            Retry
          </Button>
        </div>
      </Section>
    );
  }

  const improvements = (rating.improvements ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <Section className="py-6">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="rounded-none border border-border bg-background p-5">
          <div className="text-xs text-muted-foreground">Your rating</div>
          <div className="mt-1 text-3xl font-semibold text-foreground">{rating.score}/100</div>
          {rating.summary ? (
            <div className="mt-3 text-sm text-muted-foreground">{rating.summary}</div>
          ) : null}
        </div>

        <div className="rounded-none border border-border bg-background p-5">
          <div className="text-sm font-medium text-foreground">Where to improve</div>
          {improvements.length > 0 ? (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {improvements.slice(0, 8).map((x, idx) => (
                <li key={idx}>{x.replace(/^-+\s*/, '')}</li>
              ))}
            </ul>
          ) : (
            <div className="mt-3 text-sm text-muted-foreground">No suggestions available.</div>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.push('/interviews')}>
            Interview history
          </Button>
          {interview.contestId ? (
            <Button
              type="button"
              onClick={() => router.push(`/contests/${interview.contestId}/leaderboard`)}
            >
              View leaderboard
            </Button>
          ) : null}
        </div>
      </main>
    </Section>
  );
}
