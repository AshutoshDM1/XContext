'use client';

import { useCallback, useMemo, useState } from 'react';
import { FilePlusIcon, FolderPlusIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Tree, type TreeViewElement } from '@/components/ui/file-tree';
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
import { cn } from '@/lib/utils';
import { findFirstFilePath, joinParentAndFilename } from '@/store/codeEditor';

const FOLDER_ID_PREFIX = 'folder:';

function fsPathFromTreeId(id: string): string {
  return id.startsWith(FOLDER_ID_PREFIX) ? id.slice(FOLDER_ID_PREFIX.length) : id;
}

function parentFromFsPath(path: string): string {
  const i = path.lastIndexOf('/');
  if (i <= 0) return '';
  return path.slice(0, i);
}

type RenameTarget = {
  id: string;
  name: string;
  fsPath: string;
  parent: string;
};

type DeleteTarget = {
  id: string;
  name: string;
  fsPath: string;
};

export type ContestFileTreeProps = {
  className?: string;
  treeElements: TreeViewElement[];
  treeRevision: number;
  selectedFilePath: string | null;
  expandedFolderIds: string[];
  onSelect: (id: string) => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onRename: (oldPath: string, newPath: string) => Promise<void>;
  onDelete: (path: string) => Promise<void>;
  afterFilesystemChange?: () => Promise<void>;
};

export function ContestFileTree({
  className,
  treeElements,
  treeRevision,
  selectedFilePath,
  expandedFolderIds,
  onSelect,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
  afterFilesystemChange,
}: ContestFileTreeProps) {
  const [renameTarget, setRenameTarget] = useState<RenameTarget | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [busy, setBusy] = useState(false);

  const canShowActions = useMemo(() => treeElements.length > 0, [treeElements.length]);

  const openRename = useCallback((el: TreeViewElement) => {
    const fsPath = fsPathFromTreeId(el.id);
    setRenameTarget({
      id: el.id,
      name: el.name,
      fsPath,
      parent: parentFromFsPath(fsPath),
    });
    setRenameValue(el.name);
  }, []);

  const openDelete = useCallback((el: TreeViewElement) => {
    setDeleteTarget({
      id: el.id,
      name: el.name,
      fsPath: fsPathFromTreeId(el.id),
    });
  }, []);

  const submitRename = useCallback(async () => {
    if (!renameTarget) return;
    const nextName = renameValue.trim();
    if (!nextName) {
      toast.error('Enter a name');
      return;
    }
    if (nextName.includes('/')) {
      toast.error('Name cannot include /');
      return;
    }
    const nextPath = joinParentAndFilename(renameTarget.parent, nextName);
    setBusy(true);
    try {
      await onRename(renameTarget.fsPath, nextPath);
      setRenameTarget(null);
      toast.success('Renamed');
      await afterFilesystemChange?.();
      const first = findFirstFilePath(treeElements);
      if (first) onSelect(first);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not rename');
    } finally {
      setBusy(false);
    }
  }, [afterFilesystemChange, onRename, onSelect, renameTarget, renameValue, treeElements]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await onDelete(deleteTarget.fsPath);
      setDeleteTarget(null);
      toast.success('Deleted');
      await afterFilesystemChange?.();
      const first = findFirstFilePath(treeElements);
      if (first) onSelect(first);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not delete');
    } finally {
      setBusy(false);
    }
  }, [afterFilesystemChange, deleteTarget, onDelete, onSelect, treeElements]);

  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      <div className="flex shrink-0 items-center justify-between gap-2 px-2 py-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Files
        </p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7 text-muted-foreground hover:text-foreground"
            title="New file"
            aria-label="New file"
            onClick={onNewFile}
          >
            <FilePlusIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7 text-muted-foreground hover:text-foreground"
            title="New folder"
            aria-label="New folder"
            onClick={onNewFolder}
          >
            <FolderPlusIcon className="size-4" />
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {canShowActions ? (
          <Tree
            key={treeRevision}
            className="h-full min-h-32"
            elements={treeElements}
            initialSelectedId={selectedFilePath ?? undefined}
            initialExpandedItems={expandedFolderIds}
            onSelectedIdChange={(id) => {
              if (id) onSelect(id);
            }}
            renderActions={(el) => (
              <>
                <button
                  type="button"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  title="Rename"
                  aria-label={`Rename ${el.name}`}
                  onClick={() => openRename(el)}
                >
                  <PencilSimpleIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-destructive"
                  title="Delete"
                  aria-label={`Delete ${el.name}`}
                  onClick={() => openDelete(el)}
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          />
        ) : (
          <p className="px-2 text-xs text-muted-foreground">No files</p>
        )}
      </div>

      <Dialog open={renameTarget !== null} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
            <DialogDescription>Enter a new name for the selected item.</DialogDescription>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === 'Enter') void submitRename();
            }}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRenameTarget(null)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button type="button" onClick={() => void submitRename()} disabled={busy}>
              {busy ? 'Renaming…' : 'Rename'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete</DialogTitle>
            <DialogDescription>
              This will permanently delete <span className="font-medium">{deleteTarget?.name}</span>
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void confirmDelete()}
              disabled={busy}
            >
              {busy ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
