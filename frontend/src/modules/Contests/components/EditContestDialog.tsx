'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
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
import { useCategories } from '@/hooks/useCategories';
import { Switch } from '@/components/ui/switch';
import { DateTimePicker } from './DateTimePicker';
import { toast } from 'sonner';

interface ProjectInput {
  projectId: string;
  problemMarkdown: string;
}

interface EditContestDialogProps {
  contest: Contest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin?: boolean;
}

export function EditContestDialog({
  contest,
  open,
  onOpenChange,
  isAdmin,
}: EditContestDialogProps) {
  const { mutate: updateContest, isPending } = useUpdateContest();
  const { data: categories } = useCategories();

  const [title, setTitle] = useState(contest.title);
  const [shortDescription, setShortDescription] = useState(contest.shortDescription);
  const [topbarDescription, setTopbarDescription] = useState(contest.topbarDescription || '');
  const [status, setStatus] = useState<ContestStatus>(contest.status);
  const [startsAt, setStartsAt] = useState<Date | null>(
    contest.startsAt ? new Date(contest.startsAt) : null,
  );
  const [endsAt, setEndsAt] = useState<Date | null>(
    contest.endsAt ? new Date(contest.endsAt) : null,
  );
  const [projects, setProjects] = useState<ProjectInput[]>(contest.projects);
  const [isPrivate, setIsPrivate] = useState<boolean>(contest.isPrivate);
  const [isPublic, setIsPublic] = useState<boolean>(contest.isPublic);
  const [categoryIds, setCategoryIds] = useState<number[]>(
    contest.contestCategories?.map((cc) => cc.categoryId) ?? [],
  );

  useEffect(() => {
    if (!open) return;
    const sync = () => {
      setTitle(contest.title);
      setShortDescription(contest.shortDescription);
      setTopbarDescription(contest.topbarDescription || '');
      setStatus(contest.status);
      setStartsAt(contest.startsAt ? new Date(contest.startsAt) : null);
      setEndsAt(contest.endsAt ? new Date(contest.endsAt) : null);
      setProjects(contest.projects);
      setIsPrivate(contest.isPrivate);
      setIsPublic(contest.isPublic);
      setCategoryIds(contest.contestCategories?.map((cc) => cc.categoryId) ?? []);
    };
    queueMicrotask(sync);
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
          id: contest.id,
          title,
          shortDescription,
          topbarDescription: topbarDescription || undefined,
          isPrivate,
          ...(isAdmin ? { isPublic } : {}),
          categoryIds: categoryIds.length > 0 ? categoryIds : [],
          status,
          startsAt: startsAt ? startsAt.toISOString() : undefined,
          endsAt: endsAt ? endsAt.toISOString() : undefined,
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
                <Label>Share via link</Label>
                <div className="flex items-center justify-between gap-3 rounded-none border border-border bg-muted/20 p-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">Accessible</div>
                    <div className="text-xs text-muted-foreground">
                      Anyone with the link can open the contest.
                    </div>
                  </div>
                  <Switch
                    checked={!isPrivate}
                    onCheckedChange={(checked) => {
                      setIsPrivate(!checked);
                      if (checked) setIsPublic(false);
                    }}
                    disabled={isPublic}
                  />
                </div>
              </div>

              {isAdmin ? (
                <div className="space-y-2">
                  <Label>Public listing</Label>
                  <div className="flex items-center justify-between gap-3 rounded-none border border-border bg-muted/20 p-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium">Show in panel</div>
                      <div className="text-xs text-muted-foreground">
                        Public contests are listed for everyone.
                      </div>
                    </div>
                    <Switch
                      checked={isPublic}
                      onCheckedChange={(checked) => {
                        setIsPublic(checked);
                        if (checked) setIsPrivate(false);
                      }}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {categories && categories.length > 0 ? (
              <div className="space-y-2">
                <Label>Categories (max 3)</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const active = categoryIds.includes(cat.id);
                    const disabled = !active && categoryIds.length >= 3;
                    return (
                      <Button
                        key={cat.id}
                        type="button"
                        size="sm"
                        variant={active ? 'default' : 'outline'}
                        disabled={disabled}
                        onClick={() => {
                          setCategoryIds((prev) =>
                            prev.includes(cat.id)
                              ? prev.filter((x) => x !== cat.id)
                              : [...prev, cat.id],
                          );
                        }}
                      >
                        {cat.name}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ContestStatus)}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LIVE">LIVE</SelectItem>
                    <SelectItem value="ENDED">ENDED</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Live window (optional)</Label>
                <DateTimePicker
                  value={startsAt}
                  onChange={setStartsAt}
                  placeholder="Pick start date & time"
                />
              </div>
              <div className="space-y-2">
                <Label>Ends at (optional)</Label>
                <DateTimePicker
                  value={endsAt}
                  onChange={setEndsAt}
                  placeholder="Pick end date & time"
                />
              </div>
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
                <div key={index} className="space-y-3 rounded-none border p-4">
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
                    <Label htmlFor={`projectId-${index}`}>Project Name *</Label>
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
