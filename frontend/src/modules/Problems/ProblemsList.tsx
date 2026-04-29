'use client';

import { useProblems } from '@/hooks/useProblems';
import { CreateProblemDialog } from './components/CreateProblemDialog';
import Loader from '@/shared/Loader/Loader';
import Section from '@/shared/Section/Section';

interface ProblemsListProps {
  contestId: number;
}

export function ProblemsList({ contestId }: ProblemsListProps) {
  const { data: problems, isLoading } = useProblems(contestId);

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader size="sm" message="Loading problems..." />
      </div>
    );
  }

  return (
    <Section className="py-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Problems</h2>
          <CreateProblemDialog contestId={contestId} />
        </div>

        {problems && problems.length > 0 ? (
          <div className="space-y-4">
            {problems.map((problem) => (
              <div key={problem.id} className="rounded-lg border p-4">
                <h3 className="font-medium">{problem.projectId}</h3>
                <div className="mt-2 text-sm text-muted-foreground">
                  {problem.problemMarkdown.substring(0, 200)}...
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No problems yet. Add your first problem!
            </p>
          </div>
        )}
      </div>
    </Section>
  );
}
