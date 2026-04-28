'use client';
import { useMemo } from 'react';
import { useContestStore } from '@/store/contests';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import Section from '@/shared/Section/Section';
import CodeDoc from './components/CodeDoc';
import CodeEditor from './components/CodeEditor';
import ToolTopbar from './components/ToolTopbar';

export type ContestProps = {
  contestId: string;
};

export default function Contest({ contestId }: ContestProps) {
  const { getContestById } = useContestStore();

  const contest = useMemo(() => getContestById(contestId), [contestId, getContestById]);

  if (!contest) {
    return (
      <Section className="py-6">
        <div className="text-foreground">Contest not found</div>
      </Section>
    );
  }

  const firstProject = contest.projects[0];

  return (
    <Section className="py-6">
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-none border bg-background">
        <ToolTopbar title={contest.title} description={contest.topbarDescription} />
        <div className="min-h-0 flex-1">
          <ResizablePanelGroup
            orientation="horizontal"
            className="h-full min-h-[calc(100dvh-14rem)]"
          >
            <ResizablePanel defaultSize={50} minSize={25} className="min-h-0">
              <CodeDoc
                title={contest.title}
                problemMarkdown={firstProject?.problemMarkdown || ''}
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
