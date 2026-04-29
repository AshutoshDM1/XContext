'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { UploadSimpleIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCodeEditorStore } from '@/store/codeEditor';
import type { FileSystemTree } from '@webcontainer/api';

type DirectoryTreeNode = { directory: FileSystemTree };
type FileTreeNode = { file: { contents: string } };
type TreeNode = DirectoryTreeNode | FileTreeNode;

type DirectoryInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  webkitdirectory?: string;
  directory?: string;
};

function normalizePath(p: string): string {
  return p.replace(/\\/g, '/').replace(/^\/+/, '').trim();
}

function containsPathSegment(path: string, segment: string): boolean {
  const parts = normalizePath(path).split('/').filter(Boolean);
  return parts.includes(segment);
}

function stripCommonRoot(paths: string[]): { root: string | null; stripped: string[] } {
  const segs = paths
    .map((p) => normalizePath(p))
    .filter(Boolean)
    .map((p) => p.split('/').filter(Boolean));
  if (segs.length === 0) return { root: null, stripped: [] };
  const first = segs[0]?.[0];
  if (!first) return { root: null, stripped: paths };
  const allShare = segs.every((s) => s[0] === first);
  if (!allShare) return { root: null, stripped: paths.map(normalizePath) };
  return {
    root: first,
    stripped: paths.map((p) => {
      const t = normalizePath(p);
      return t.startsWith(`${first}/`) ? t.slice(first.length + 1) : t;
    }),
  };
}

function setTreeFile(tree: FileSystemTree, filePath: string, contents: string) {
  const parts = filePath.split('/').filter(Boolean);
  if (parts.length === 0) return;
  let cur: FileSystemTree = tree;
  for (let i = 0; i < parts.length; i += 1) {
    const name = parts[i]!;
    const isLast = i === parts.length - 1;
    if (isLast) {
      cur[name] = { file: { contents } } satisfies TreeNode as unknown as TreeNode;
    } else {
      const existing = cur[name] as TreeNode | undefined;
      if (!existing || !('directory' in existing)) {
        cur[name] = { directory: {} } satisfies TreeNode as unknown as TreeNode;
      }
      cur = (cur[name] as DirectoryTreeNode).directory;
    }
  }
}

async function fileToText(file: File): Promise<string | null> {
  // Keep it simple: only text files. Skip large/binary safely.
  const MAX_BYTES = 2_000_000; // 2MB
  if (file.size > MAX_BYTES) return null;
  try {
    return await file.text();
  } catch {
    return null;
  }
}

export type UploadCodebaseProps = {
  projectId: number | undefined;
  hasExistingCode: boolean;
  onPersist: (tree: FileSystemTree) => Promise<void>;
};

export function UploadCodebase({ projectId, hasExistingCode, onPersist }: UploadCodebaseProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const ready = useCodeEditorStore((s) => s.bootStatus) === 'ready';

  const disabled = !ready || !projectId || uploading;

  const label = useMemo(() => {
    if (!ready) return 'Editor not ready';
    if (!projectId) return 'Select a problem';
    return hasExistingCode ? 'Upload folder (replace)' : 'Upload folder';
  }, [ready, projectId, hasExistingCode]);

  const triggerPick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handlePick = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      e.target.value = '';
      if (files.length === 0) return;

      setUploading(true);
      try {
        const rawPaths = files.map((f) => f.webkitRelativePath || f.name);
        const { stripped } = stripCommonRoot(rawPaths);

        const tree: FileSystemTree = {};
        let added = 0;
        for (let i = 0; i < files.length; i += 1) {
          const file = files[i]!;
          const rel = normalizePath(stripped[i] ?? file.name);
          if (!rel || rel.includes('..')) continue;
          // Skip node_modules anywhere in the tree
          if (containsPathSegment(rel, 'node_modules')) continue;
          const text = await fileToText(file);
          if (text === null) continue;
          setTreeFile(tree, rel, text);
          added += 1;
        }

        if (added === 0) {
          toast.error('No readable text files found in that folder');
          return;
        }

        await useCodeEditorStore.getState().replaceWorkspace(tree);
        await onPersist(tree);

        toast.success('Folder uploaded');
      } catch (err) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [onPersist],
  );

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        // directory selection (Chromium-based)
        {...({
          webkitdirectory: 'true',
          directory: 'true',
        } as DirectoryInputProps)}
        multiple
        className="hidden"
        onChange={handlePick}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
        onClick={triggerPick}
        disabled={disabled}
        title={label}
      >
        <UploadSimpleIcon className="size-4" />
        {uploading ? 'Uploading…' : 'Upload'}
      </Button>
    </>
  );
}
