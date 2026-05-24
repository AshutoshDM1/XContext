'use client';
import { useContest } from '@/hooks/useContests';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import Section from '@/shared/Section/Section';
import Loader from '@/shared/Loader/Loader';
import CodeDoc from './components/CodeDoc';
import CodeEditor from './components/CodeEditor';
import ToolTopbar from './components/ToolTopbar';

export type ContestProps = {
  contestId: string;
};

export default function Contest({ contestId }: ContestProps) {
  const contestIdNumber = parseInt(contestId, 10);
  const { data: contest, isLoading } = useContest(contestIdNumber);

  if (isLoading) {
    return (
      <Section className="py-6">
        <div className="flex min-h-[400px] flex-1 items-center justify-center">
          <Loader message="Loading contest..." />
        </div>
      </Section>
    );
  }

  if (!contest) {
    return (
      <Section className="py-6">
        <div className="text-foreground">Contest not found</div>
      </Section>
    );
  }

  return (
    <Section className="py-6">
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-none border bg-background">
        <ToolTopbar
          title={contest.title}
          description={contest.topbarDescription || contest.shortDescription}
        />
        <div className="min-h-0 flex-1">
          <ResizablePanelGroup
            orientation="horizontal"
            className="h-full min-h-[calc(100dvh-14rem)]"
          >
            <ResizablePanel defaultSize={50} minSize={25} className="min-h-0">
              <CodeDoc
                title={contest.title}
                projects={contest.projects}
                contestId={contestIdNumber}
              />
            </ResizablePanel>
            <ResizableHandle withHandle className="w-1.5 bg-border" />
            <ResizablePanel defaultSize={50} minSize={25} className="min-h-0">
              <CodeEditor />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </main>
    </Section>
  );
}
