'use client';
import { useMemo } from 'react';
import { getContestById } from '@/modules/Contests/data/mock-contests';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import Section from '@/shared/Section/Section';
import CodeDoc from './components/CodeDoc';
import CodeEditor from './components/CodeEditor';
import ToolTopbar from './components/ToolTopbar';

export type ContestProps = {
  contestId: string;
};

export default function Contest({ contestId }: ContestProps) {
  const contest = useMemo(() => getContestById(contestId), [contestId]);

  return (
    <Section>
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-none border border-white/15 bg-black">
        <ToolTopbar title={contest.title} description={contest.topbarDescription} />
        <div className="min-h-0 flex-1">
          <ResizablePanelGroup
            orientation="horizontal"
            className="h-full min-h-[calc(100dvh-12rem)]"
          >
            <ResizablePanel defaultSize={50} minSize={25} className="min-h-0">
              <CodeDoc title={contest.title} problemMarkdown={contest.problemMarkdown} />
            </ResizablePanel>
            <ResizableHandle withHandle className="w-1.5 bg-white/10" />
            <ResizablePanel defaultSize={50} minSize={25} className="min-h-0">
              <CodeEditor />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </main>
    </Section>
  );
}
