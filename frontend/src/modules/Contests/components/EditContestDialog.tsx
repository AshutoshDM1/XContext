'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, PencilIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type ContestStatus, type Contest } from '@/store/contests';
import { useUpdateContest } from '@/hooks/useContests';
import { toast } from 'sonner';

interface ProjectInput {
  projectId: string;
  problemMarkdown: string;
}

interface EditContestDialogProps {
  contest: Contest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditContestDialog({ contest, open, onOpenChange }: EditContestDialogProps) {
  const { mutate: updateContest, isPending } = useUpdateContest();

  const [title, setTitle] = useState(contest.title);
  const [shortDescription, setShortDescription] = useState(contest.shortDescription);
  const [topbarDescription, setTopbarDescription] = useState(contest.topbarDescription || '');
  const [status, setStatus] = useState<ContestStatus>(contest.status);
  const [timeLabel, setTimeLabel] = useState(contest.timeLabel);
  const [participantCount, setParticipantCount] = useState(String(contest.participantCount));
  const [projects, setProjects] = useState<ProjectInput[]>(contest.projects);

  useEffect(() => {
    if (open) {
      setTitle(contest.title);
      setShortDescription(contest.shortDescription);
      setTopbarDescription(contest.topbarDescription || '');
      setStatus(contest.status);
      setTimeLabel(contest.timeLabel);
      setParticipantCount(String(contest.participantCount));
      setProjects(contest.projects);
    }
  }, [open, contest]);

  const addProject = () => {
    if (projects.length < 3) {
      setProjects([...projects, { projectId: '', problemMarkdown: '' }]);
    }
  };

  const removeProject = (index: number) => {
    if (projects.length > 1) {
      setProjects(projects.filter((_, i) => i !== index));
    }
  };

  const updateProject = (index: number, field: keyof ProjectInput, value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const handleUpdate = () => {
    if (!title.trim()) {
      toast.error('Please enter a contest title');
      return;
    }

    if (!shortDescription.trim()) {
      toast.error('Please enter a short description');
      return;
    }

    if (projects.some((p) => !p.projectId.trim() || !p.problemMarkdown.trim())) {
      toast.error('Please fill in all project fields');
      return;
    }

    updateContest(
      {
        id: contest.id,
        input: {
          title,
          shortDescription,
          topbarDescription: topbarDescription || undefined,
          status,
          participantCount: parseInt(participantCount) || 0,
          timeLabel: timeLabel || 'Custom',
          projects: projects.map((p) => ({
            projectId: p.projectId.trim(),
            problemMarkdown: p.problemMarkdown.trim(),
          })),
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Edit Contest</DialogTitle>
          <DialogDescription>Update contest details and project information.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-6">
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Contest Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Full-Stack Challenge"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description *</Label>
              <Textarea
                id="shortDescription"
                placeholder="Brief overview of the contest..."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topbarDescription">Topbar Description</Label>
              <Textarea
                id="topbarDescription"
                placeholder="Description shown in the contest page topbar (optional)"
                value={topbarDescription}
                onChange={(e) => setTopbarDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ContestStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LIVE">LIVE</SelectItem>
                    <SelectItem value="ENDED">ENDED</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeLabel">Time Label</Label>
                <Input
                  id="timeLabel"
                  placeholder="e.g., Live now, Jan 1-15"
                  value={timeLabel}
                  onChange={(e) => setTimeLabel(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="participantCount">Participant Count</Label>
              <Input
                id="participantCount"
                type="number"
                placeholder="0"
                value={participantCount}
                onChange={(e) => setParticipantCount(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Projects * (1-3)</Label>
                {projects.length < 3 && (
                  <Button type="button" variant="outline" size="sm" onClick={addProject}>
                    <PlusIcon className="size-4" />
                    Add Project
                  </Button>
                )}
              </div>

              {projects.map((project, index) => (
                <div key={index} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Project {index + 1}</span>
                    {projects.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProject(index)}
                      >
                        <TrashIcon className="size-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`projectId-${index}`}>Project ID *</Label>
                    <Input
                      id={`projectId-${index}`}
                      placeholder="e.g., todo-app-project"
                      value={project.projectId}
                      onChange={(e) => updateProject(index, 'projectId', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`markdown-${index}`}>Problem Markdown *</Label>
                    <Textarea
                      id={`markdown-${index}`}
                      placeholder="# Problem Title&#10;&#10;Write your problem description in markdown..."
                      value={project.problemMarkdown}
                      onChange={(e) => updateProject(index, 'problemMarkdown', e.target.value)}
                      rows={8}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isPending}>
            {isPending ? 'Updating...' : 'Update Contest'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
