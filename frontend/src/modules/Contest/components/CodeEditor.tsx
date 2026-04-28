'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowsClockwiseIcon,
  CircleNotchIcon,
  FilePlusIcon,
  FloppyDiskIcon,
  FolderPlusIcon,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Tree } from '@/components/ui/file-tree';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { cn } from '@/lib/utils';
import {
  collectFolderIdsFromTree,
  collectFolderPathOptions,
  defaultParentFromSelectedPath,
  joinParentAndFilename,
  normalizeEditorPath,
  subscribeWebContainerFilesystem,
  useCodeEditorStore,
} from '@/store/codeEditor';
import { ContestMonacoEditor } from './ContestMonacoEditor';
import { ContestWebTerminal } from './ContestWebTerminal';

type CreateDialogMode = 'file' | 'folder';

const CodeEditor = () => {
  const bootStatus = useCodeEditorStore((s) => s.bootStatus);
  const bootError = useCodeEditorStore((s) => s.bootError);
  const treeElements = useCodeEditorStore((s) => s.treeElements);
  const treeRevision = useCodeEditorStore((s) => s.treeRevision);
  const selectedFilePath = useCodeEditorStore((s) => s.selectedFilePath);
  const editorValue = useCodeEditorStore((s) => s.editorValue);
  const isDirty = useCodeEditorStore((s) => s.isDirty);
  const setEditorValue = useCodeEditorStore((s) => s.setEditorValue);
  const selectTreeId = useCodeEditorStore((s) => s.selectTreeId);
  const boot = useCodeEditorStore((s) => s.boot);
  const teardown = useCodeEditorStore((s) => s.teardown);
  const save = useCodeEditorStore((s) => s.save);
  const createFile = useCodeEditorStore((s) => s.createFile);
  const createFolder = useCodeEditorStore((s) => s.createFolder);
  const webcontainer = useCodeEditorStore((s) => s.webcontainer);

  const [createDialog, setCreateDialog] = useState<CreateDialogMode | null>(null);
  const [createParentPath, setCreateParentPath] = useState('');
  const [createNameInput, setCreateNameInput] = useState('');

  const expandedFolderIds = useMemo(() => collectFolderIdsFromTree(treeElements), [treeElements]);

  const folderOptions = useMemo(() => collectFolderPathOptions(treeElements), [treeElements]);
  const folderValueSet = useMemo(() => new Set(folderOptions.map((o) => o.value)), [folderOptions]);

  useEffect(() => {
    void useCodeEditorStore.getState().boot();
    return () => {
      useCodeEditorStore.getState().teardown();
    };
  }, []);

  useEffect(() => {
    if (bootStatus !== 'ready' || !webcontainer) return undefined;
    return subscribeWebContainerFilesystem(webcontainer, () => {
      void useCodeEditorStore.getState().refreshTreeFromFs();
    });
  }, [bootStatus, webcontainer]);

  const handleSave = useCallback(async () => {
    const result = await save();
    if (result === 'error') {
      toast.error('Could not save file');
      return;
    }
    if (result === 'written') {
      toast.success('Saved');
    }
  }, [save]);

  const closeCreateDialog = useCallback(() => {
    setCreateDialog(null);
    setCreateNameInput('');
    setCreateParentPath('');
  }, []);

  const openCreateFileDialog = useCallback(() => {
    setCreateParentPath(defaultParentFromSelectedPath(selectedFilePath, folderValueSet));
    setCreateNameInput('');
    setCreateDialog('file');
  }, [selectedFilePath, folderValueSet]);

  const openCreateFolderDialog = useCallback(() => {
    setCreateParentPath(defaultParentFromSelectedPath(selectedFilePath, folderValueSet));
    setCreateNameInput('');
    setCreateDialog('folder');
  }, [selectedFilePath, folderValueSet]);

  const submitCreateDialog = useCallback(async () => {
    if (!createDialog) return;
    if (!folderValueSet.has(createParentPath)) {
      toast.error('That parent folder is no longer available. Close the dialog and try again.');
      return;
    }
    let fullPath: string;
    try {
      fullPath = joinParentAndFilename(createParentPath, createNameInput);
      normalizeEditorPath(fullPath);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Invalid path');
      return;
    }
    try {
      if (createDialog === 'file') {
        const outcome = await createFile(fullPath);
        toast.success(outcome === 'opened' ? 'Opened existing file' : 'File created');
      } else {
        await createFolder(fullPath);
        toast.success('Folder created');
      }
      closeCreateDialog();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong');
    }
  }, [
    createDialog,
    createParentPath,
    createNameInput,
    folderValueSet,
    createFile,
    createFolder,
    closeCreateDialog,
  ]);

  const statusLabel =
    bootStatus === 'idle' || bootStatus === 'booting'
      ? 'Starting environment…'
      : bootStatus === 'ready'
        ? 'Ready'
        : 'Error';

  return (
    <div className="flex h-full min-h-0 flex-col border-l bg-background text-foreground">
      <Dialog open={createDialog !== null} onOpenChange={(open) => !open && closeCreateDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{createDialog === 'folder' ? 'New folder' : 'New file'}</DialogTitle>
            <DialogDescription>
              Choose the parent folder, then enter a single name (no{' '}
              <code className="text-foreground">/</code> in the name).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <span className="text-xs text-muted-foreground">Parent folder</span>
              <Select
                value={createParentPath === '' ? '__root__' : createParentPath}
                onValueChange={(v) => setCreateParentPath(v === '__root__' ? '' : v)}
              >
                <SelectTrigger size="sm" className="h-8 w-full max-w-none">
                  <SelectValue placeholder="Parent folder" />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-60">
                  {folderOptions.map((opt) => (
                    <SelectItem
                      key={opt.value || '__root__'}
                      value={opt.value === '' ? '__root__' : opt.value}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <span className="text-xs text-muted-foreground">
                {createDialog === 'folder' ? 'Folder name' : 'File name'}
              </span>
              <Input
                value={createNameInput}
                onChange={(e) => setCreateNameInput(e.target.value)}
                placeholder={createDialog === 'folder' ? 'e.g. extras' : 'e.g. utils.ts'}
                autoComplete="off"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void submitCreateDialog();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeCreateDialog}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void submitCreateDialog()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex shrink-0 items-center justify-between gap-2 border-b bg-muted/50 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          {bootStatus === 'booting' ? (
            <CircleNotchIcon className="size-4 shrink-0 animate-spin text-muted-foreground" />
          ) : (
            <span
              className={cn(
                'size-2 shrink-0 rounded-full',
                bootStatus === 'ready' && 'bg-emerald-500',
                bootStatus === 'error' && 'bg-red-500',
                bootStatus === 'idle' && 'bg-muted-foreground',
              )}
              aria-hidden
            />
          )}
          <span className="truncate text-xs text-muted-foreground">{statusLabel}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {bootStatus === 'ready' && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-8 text-muted-foreground hover:text-foreground"
                title="New file"
                aria-label="New file"
                onClick={openCreateFileDialog}
              >
                <FilePlusIcon className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-8 text-muted-foreground hover:text-foreground"
                title="New folder"
                aria-label="New folder"
                onClick={openCreateFolderDialog}
              >
                <FolderPlusIcon className="size-4" />
              </Button>
            </>
          )}
          {bootStatus === 'error' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={() => {
                teardown();
                void boot();
              }}
            >
              <ArrowsClockwiseIcon className="size-4" />
              Retry
            </Button>
          )}
        </div>
      </div>

      <ResizablePanelGroup orientation="vertical" className="min-h-0 flex-1">
        <ResizablePanel defaultSize={68} minSize={35} className="min-h-0">
          <div className="flex h-full min-h-0 flex-1">
            <aside className="flex w-54 shrink-0 flex-col border-r bg-muted/40">
              <p className="shrink-0 px-2 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Files
              </p>
              <div className="min-h-0 flex-1">
                {bootStatus === 'error' ? (
                  <p className="px-2 text-xs leading-relaxed text-destructive">{bootError}</p>
                ) : bootStatus === 'booting' || bootStatus === 'idle' ? (
                  <p className="px-2 text-xs text-muted-foreground">Loading file tree…</p>
                ) : treeElements.length > 0 ? (
                  <Tree
                    key={treeRevision}
                    className="h-full min-h-32"
                    elements={treeElements}
                    initialSelectedId={selectedFilePath ?? undefined}
                    initialExpandedItems={expandedFolderIds}
                    onSelectedIdChange={(id) => {
                      if (id) void selectTreeId(id);
                    }}
                  />
                ) : (
                  <p className="px-2 text-xs text-muted-foreground">No files</p>
                )}
              </div>
            </aside>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              {bootStatus === 'ready' && selectedFilePath ? (
                <>
                  <div className="flex shrink-0 items-center justify-between gap-2 border-b bg-muted/30 px-3 py-1.5">
                    <span className="min-w-0 truncate font-mono text-xs text-muted-foreground">
                      {selectedFilePath}
                      {isDirty ? (
                        <span className="text-amber-500" aria-label="Unsaved changes">
                          {' '}
                          •
                        </span>
                      ) : null}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 shrink-0 gap-1.5 text-xs"
                      onClick={() => void handleSave()}
                    >
                      <FloppyDiskIcon className="size-3.5" />
                      Save
                    </Button>
                  </div>
                  <div className="min-h-0 min-w-0 flex-1">
                    <ContestMonacoEditor
                      filePath={selectedFilePath}
                      value={editorValue}
                      onChange={setEditorValue}
                      onSave={handleSave}
                    />
                  </div>
                </>
              ) : bootStatus === 'ready' ? (
                <div className="flex flex-1 items-center justify-center px-4">
                  <p className="text-center text-sm text-muted-foreground">Select a file to edit</p>
                </div>
              ) : bootStatus === 'error' ? (
                <div className="flex flex-1 items-center justify-center px-4">
                  <p className="text-center text-sm text-muted-foreground">
                    Fix the issue above, then retry to use the editor.
                  </p>
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center px-4">
                  <p className="text-center text-sm text-muted-foreground">
                    Preparing WebContainer…
                  </p>
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle className="h-1.5 shrink-0 bg-border" />
        <ResizablePanel defaultSize={32} minSize={12} className="min-h-0">
          <ContestWebTerminal />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default CodeEditor;
