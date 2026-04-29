'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateProblem } from '@/hooks/useProblems';
import { toast } from 'sonner';
import { PlusIcon } from '@phosphor-icons/react';

interface CreateProblemDialogProps {
  contestId: number;
}

export function CreateProblemDialog({ contestId }: CreateProblemDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate: createProblem, isPending } = useCreateProblem();

  const [projectId, setProjectId] = useState('');
  const [problemMarkdown, setProblemMarkdown] = useState('');

  const resetForm = () => {
    setProjectId('');
    setProblemMarkdown('');
  };

  const handleCreate = () => {
    if (!projectId.trim()) {
      toast.error('Please enter a project ID');
      return;
    }

    if (!problemMarkdown.trim()) {
      toast.error('Please enter problem markdown');
      return;
    }

    createProblem(
      {
        contestId,
        projectId: projectId.trim(),
        problemMarkdown: problemMarkdown.trim(),
      },
      {
        onSuccess: () => {
          resetForm();
          setOpen(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <PlusIcon className="size-4" />
          Add Problem
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Problem</DialogTitle>
          <DialogDescription>Add a new problem to this contest.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="projectId">Project ID *</Label>
            <Input
              id="projectId"
              placeholder="e.g., todo-app-project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="problemMarkdown">Problem Markdown *</Label>
            <Textarea
              id="problemMarkdown"
              placeholder="# Problem Title&#10;&#10;Write your problem description in markdown..."
              value={problemMarkdown}
              onChange={(e) => setProblemMarkdown(e.target.value)}
              rows={12}
              className="font-mono text-xs"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Problem'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
