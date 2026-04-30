'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useCreateInterview } from '@/hooks/useInterviews';
import type { Project } from '@/store/contests';
import type { CodeSubmission } from '@/services/codeSubmissions.service';
import useUser from '@/hooks/useUser';

type Props = {
  projects: Project[];
  submissions: CodeSubmission[] | undefined;
  isLoadingSubmissions?: boolean;
  contestTitle: string;
};

export default function AiInterviewLauncher({
  projects,
  submissions,
  isLoadingSubmissions,
  contestTitle,
}: Props) {
  const router = useRouter();
  const { mutateAsync: createInterview, isPending: isStartingInterview } = useCreateInterview();
  const { name } = useUser({ name: true });

  const [open, setOpen] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);

  const availableInterviewProjects = useMemo(() => {
    if (!submissions || submissions.length === 0) return [];
    const byProjectId = new Map<number, { projectId: number; label: string; name?: string }>();
    for (const s of submissions) {
      if (!byProjectId.has(s.projectId)) {
        const idx = projects.findIndex((p) => p.id === s.projectId);
        const label = idx >= 0 ? `Problem ${idx + 1}` : `Problem`;
        byProjectId.set(s.projectId, { projectId: s.projectId, label, name: s.projectName });
      }
    }
    return Array.from(byProjectId.values()).sort((a, b) => a.projectId - b.projectId);
  }, [submissions, projects]);

  const canStart = availableInterviewProjects.length > 0 && !isLoadingSubmissions;

  const buildTitle = () => {
    const dt = new Date();
    const datePart = dt.toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
    const timePart = dt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const userPart = (name ?? 'User').trim() || 'User';
    return `${contestTitle} • ${userPart} • ${datePart} ${timePart}`;
  };

  const buildDescription = (projectIds: number[]) => {
    const names = projectIds
      .map((id) => projects.find((p) => p.id === id)?.projectId)
      .filter(Boolean) as string[];
    return names.length > 0 ? names.join(', ') : 'Selected problems';
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        className="h-8 rounded-none"
        disabled={!canStart || isStartingInterview}
        onClick={() => {
          if (!canStart) return;
          setSelectedProjectIds(availableInterviewProjects.map((p) => p.projectId));
          setOpen(true);
        }}
      >
        AI Interview
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start AI interview</DialogTitle>
            <DialogDescription>
              Choose which problems to include. For each selected problem, we’ll use the latest
              submitted code.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            {availableInterviewProjects.length === 0 ? (
              <div className="rounded-none border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground">
                No submissions yet. Submit at least one problem to start an interview.
              </div>
            ) : (
              <div className="grid gap-2">
                {availableInterviewProjects.map((p) => {
                  const checked = selectedProjectIds.includes(p.projectId);
                  const text = p.name ? `${p.label} • ${p.name}` : p.label;
                  return (
                    <div
                      key={p.projectId}
                      className="flex items-start gap-2 rounded-none border p-2"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => {
                          const next = Boolean(v);
                          setSelectedProjectIds((prev) => {
                            if (next) return Array.from(new Set([...prev, p.projectId]));
                            return prev.filter((id) => id !== p.projectId);
                          });
                        }}
                        aria-label={`Select ${text}`}
                      />
                      <Label className="flex-1">
                        <span className="text-foreground">{text}</span>
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={selectedProjectIds.length === 0 || isStartingInterview}
              onClick={async () => {
                try {
                  const created = await createInterview({
                    projectIds: selectedProjectIds,
                    title: buildTitle(),
                    description: buildDescription(selectedProjectIds),
                  });
                  setOpen(false);
                  router.push(`/interview/${created.id}`);
                } catch {
                  toast.error('Failed to start interview');
                }
              }}
            >
              Start
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
