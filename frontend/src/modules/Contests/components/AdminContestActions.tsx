'use client';

import { useState } from 'react';
import { DotsThreeVertical, PencilSimple, Trash } from '@phosphor-icons/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { type Contest } from '@/store/contests';
import { useDeleteContest } from '@/hooks/useContests';
import { EditContestDialog } from './EditContestDialog';

interface AdminContestActionsProps {
  contest: Contest;
  isAdmin?: boolean;
}

export function AdminContestActions({ contest, isAdmin }: AdminContestActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { mutate: deleteContest, isPending: isDeleting } = useDeleteContest();

  const handleDelete = () => {
    deleteContest(contest.id, {
      onSuccess: () => {
        setDeleteOpen(false);
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => e.stopPropagation()}
          >
            <DotsThreeVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="text-nowrap min-w-36">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setEditOpen(true);
            }}
          >
            <PencilSimple className="mr-2 h-4 w-4" />
            Edit Contest
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setDeleteOpen(true);
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Contest
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditContestDialog
        contest={contest}
        open={editOpen}
        onOpenChange={setEditOpen}
        isAdmin={isAdmin}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete &quot;{contest.title}&quot;. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
