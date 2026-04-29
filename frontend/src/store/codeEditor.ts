/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import type { WebContainer } from '@webcontainer/api';
import type { DirectoryNode, FileSystemAPI, FileSystemTree } from '@webcontainer/api';
import type { TreeViewElement } from '@/components/ui/file-tree';

declare global {
  var __xcontext_webcontainer__: WebContainer | undefined;
  var __xcontext_webcontainer_boot_promise__: Promise<WebContainer> | undefined;
}

const FOLDER_ID_PREFIX = 'folder:';

/** Directory names omitted from the file tree (never read from disk — keeps UI fast). */
const EXCLUDED_TREE_DIRS = new Set(['node_modules']);

function shouldOmitDirectoryFromTree(name: string): boolean {
  return EXCLUDED_TREE_DIRS.has(name);
}

/** Starter files mounted into WebContainer (paths are relative to the container workdir). */
export const INITIAL_CONTEST_FILE_TREE: FileSystemTree = {
  'README.md': {
    file: {
      contents: `# XContext\n\nThis is a project that allows you to create and manage contests.\n`,
    },
  },
  src: {
    directory: {
      'index.ts': {
        file: {
          contents: `console.log('Hello, world!');`,
        },
      },
    },
  },
};

/** Deep snapshot of INITIAL_CONTEST_FILE_TREE for DB/API — matches WebContainer boot exactly. */
export function getInitialContestCodeSnapshot(): FileSystemTree {
  return JSON.parse(JSON.stringify(INITIAL_CONTEST_FILE_TREE)) as FileSystemTree;
}

function isDirectoryNode(node: FileSystemTree[keyof FileSystemTree]): node is DirectoryNode {
  return 'directory' in node;
}

function isSymlinkNode(node: FileSystemTree[keyof FileSystemTree]): boolean {
  return 'file' in node && 'symlink' in node.file;
}

export function fileSystemTreeToViewElements(
  tree: FileSystemTree,
  basePath = '',
): TreeViewElement[] {
  const entries = Object.entries(tree);
  const out: TreeViewElement[] = [];

  for (const [name, node] of entries) {
    const relPath = basePath ? `${basePath}/${name}` : name;

    if (isSymlinkNode(node)) {
      continue;
    }

    if (isDirectoryNode(node) && shouldOmitDirectoryFromTree(name)) {
      continue;
    }

    if (isDirectoryNode(node)) {
      const children = fileSystemTreeToViewElements(node.directory, relPath);
      out.push({
        id: `${FOLDER_ID_PREFIX}${relPath}`,
        name,
        type: 'folder',
        children,
      });
    } else {
      out.push({
        id: relPath,
        name,
        type: 'file',
      });
    }
  }

  return out;
}

export function collectFolderIdsFromTree(elements: TreeViewElement[]): string[] {
  const ids: string[] = [];
  const walk = (nodes: TreeViewElement[]) => {
    for (const el of nodes) {
      if (el.children && el.children.length > 0) {
        ids.push(el.id);
        walk(el.children);
      }
    }
  };
  walk(elements);
  return ids;
}

export type FolderSelectOption = { value: string; label: string };

/** All folder paths for a parent selector (includes project root as `value: ""`). */
export function collectFolderPathOptions(elements: TreeViewElement[]): FolderSelectOption[] {
  const folders: FolderSelectOption[] = [{ value: '', label: 'Project root' }];
  const walk = (nodes: TreeViewElement[]) => {
    for (const el of nodes) {
      if (el.children && el.children.length > 0 && el.id.startsWith(FOLDER_ID_PREFIX)) {
        const path = el.id.slice(FOLDER_ID_PREFIX.length);
        folders.push({ value: path, label: `${path}/` });
        walk(el.children);
      }
    }
  };
  walk(elements);
  const root = folders[0];
  const rest = folders
    .slice(1)
    .sort((a, b) =>
      a.value.localeCompare(b.value, undefined, { numeric: true, sensitivity: 'base' }),
    );
  return [root, ...rest];
}

/** Pick a sensible default parent from the currently open file path. */
export function defaultParentFromSelectedPath(
  selectedFilePath: string | null,
  validParents: Set<string>,
): string {
  if (!selectedFilePath) return '';
  const i = selectedFilePath.lastIndexOf('/');
  if (i <= 0) return '';
  const parent = selectedFilePath.slice(0, i);
  return validParents.has(parent) ? parent : '';
}

/** Build a path from parent folder + single segment name (no slashes in `name`). */
export function joinParentAndFilename(parent: string, name: string): string {
  const n = name.trim().replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');
  if (!n) {
    throw new Error('Enter a file or folder name');
  }
  if (n.includes('..')) {
    throw new Error('Name cannot contain ..');
  }
  if (n.includes('/')) {
    throw new Error('Use one name only (pick the parent folder above)');
  }
  const p = parent.trim().replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');
  if (p.includes('..')) {
    throw new Error('Invalid parent folder');
  }
  if (!p) {
    return n;
  }
  return `${p}/${n}`;
}

export function findFirstFilePath(elements: TreeViewElement[]): string | undefined {
  for (const el of elements) {
    if (el.children?.length) {
      const nested = findFirstFilePath(el.children);
      if (nested) return nested;
    } else if (!el.id.startsWith(FOLDER_ID_PREFIX)) {
      return el.id;
    }
  }
  return undefined;
}

/** Prefer `src/index.ts` when present, else fall back to first file. */
export function pickDefaultFilePath(elements: TreeViewElement[]): string | undefined {
  const preferred = 'src/index.ts';
  const hasPreferred = (nodes: TreeViewElement[]): boolean => {
    for (const el of nodes) {
      if (el.children?.length) {
        if (hasPreferred(el.children)) return true;
      } else if (!el.id.startsWith(FOLDER_ID_PREFIX) && el.id === preferred) {
        return true;
      }
    }
    return false;
  };
  if (hasPreferred(elements)) return preferred;
  return findFirstFilePath(elements);
}

export function normalizeEditorPath(raw: string): string {
  const t = raw.trim().replace(/\\/g, '/').replace(/^\/+/, '');
  if (!t || t.includes('..')) {
    throw new Error('Invalid path');
  }
  return t;
}

async function readFsTree(fs: FileSystemAPI, dirPath: string): Promise<FileSystemTree> {
  const tree: FileSystemTree = {};
  let entries: Awaited<ReturnType<FileSystemAPI['readdir']>>;
  try {
    entries = await fs.readdir(dirPath, { withFileTypes: true });
  } catch {
    return tree;
  }

  for (const ent of entries) {
    const name =
      typeof ent.name === 'string' ? ent.name : new TextDecoder().decode(ent.name as Uint8Array);
    const fullPath = dirPath === '.' ? name : `${dirPath.replace(/\/$/, '')}/${name}`;

    if (ent.isDirectory()) {
      if (shouldOmitDirectoryFromTree(name)) {
        continue;
      }
      const sub = await readFsTree(fs, fullPath);
      tree[name] = { directory: sub };
    } else {
      try {
        const contents = await fs.readFile(fullPath, 'utf-8');
        tree[name] = { file: { contents } };
      } catch {
        /* skip unreadable / binary */
      }
    }
  }
  return tree;
}

/** Export the entire WebContainer filesystem as JSON-serializable structure */
export async function serializeWebContainerFs(webcontainer: WebContainer): Promise<FileSystemTree> {
  try {
    const tree = await readFsTree(webcontainer.fs, '.');
    return tree;
  } catch (error) {
    console.error('Failed to serialize WebContainer filesystem:', error);
    return {};
  }
}

async function ensureParentDirs(fs: FileSystemAPI, filePath: string): Promise<void> {
  const normalized = filePath.replace(/\\/g, '/');
  const slash = normalized.lastIndexOf('/');
  if (slash <= 0) return;
  const parent = normalized.slice(0, slash);
  await fs.mkdir(parent, { recursive: true });
}

export type CodeEditorBootStatus = 'idle' | 'booting' | 'ready' | 'error';

type CodeEditorState = {
  webcontainer: WebContainer | null;
  bootStatus: CodeEditorBootStatus;
  bootError: string | null;
  treeElements: TreeViewElement[];
  treeRevision: number;
  selectedFilePath: string | null;
  editorValue: string;
  isDirty: boolean;

  boot: () => Promise<void>;
  teardown: () => void;
  refreshTreeFromFs: () => Promise<void>;
  selectTreeId: (id: string) => Promise<void>;
  setEditorValue: (value: string) => void;
  flushOpenFile: () => Promise<boolean>;
  save: () => Promise<'written' | 'noop' | 'error'>;
  createFile: (rawPath: string) => Promise<'created' | 'opened'>;
  createFolder: (rawPath: string) => Promise<void>;
  renamePath: (oldPath: string, newPath: string) => Promise<void>;
  deletePath: (path: string) => Promise<void>;
  replaceWorkspace: (tree: FileSystemTree) => Promise<void>;
};

export const useCodeEditorStore = create<CodeEditorState>((set, get) => ({
  webcontainer: null,
  bootStatus: 'idle',
  bootError: null,
  treeElements: [],
  treeRevision: 0,
  selectedFilePath: null,
  editorValue: '',
  isDirty: false,

  teardown: () => {
    const wc = get().webcontainer ?? globalThis.__xcontext_webcontainer__;
    if (wc) wc.teardown();
    globalThis.__xcontext_webcontainer__ = undefined;
    globalThis.__xcontext_webcontainer_boot_promise__ = undefined;
    set({
      webcontainer: null,
      bootStatus: 'idle',
      bootError: null,
      treeElements: [],
      treeRevision: 0,
      selectedFilePath: null,
      editorValue: '',
      isDirty: false,
    });
  },

  boot: async () => {
    const { webcontainer, bootStatus } = get();
    if (webcontainer && bootStatus === 'ready') return;
    if (bootStatus === 'booting') return;

    // WebContainer requires cross-origin isolation (SharedArrayBuffer).
    // If we boot without it, the browser can throw and the runtime may refuse further instances.
    if (typeof globalThis !== 'undefined' && (globalThis as any).crossOriginIsolated === false) {
      set({
        webcontainer: null,
        bootStatus: 'error',
        bootError:
          'WebContainer requires cross-origin isolation. Ensure COOP/COEP headers are set so window.crossOriginIsolated === true, then reload.',
        treeElements: [],
        treeRevision: 0,
        selectedFilePath: null,
        editorValue: '',
        isDirty: false,
      });
      return;
    }

    set({ bootStatus: 'booting', bootError: null });

    try {
      const { WebContainer } = await import('@webcontainer/api');
      const existing = globalThis.__xcontext_webcontainer__;

      const wc =
        existing ??
        (await (globalThis.__xcontext_webcontainer_boot_promise__ ??
          (globalThis.__xcontext_webcontainer_boot_promise__ = (async () => {
            const created = await WebContainer.boot({ coep: 'require-corp' });
            await created.mount(INITIAL_CONTEST_FILE_TREE);
            globalThis.__xcontext_webcontainer__ = created;
            return created;
          })())));

      // If we reused an already-booted container, rebuild the tree from FS.
      const treeRoot = await readFsTree(wc.fs, '.');
      const treeElements = fileSystemTreeToViewElements(treeRoot);

      const firstFile = pickDefaultFilePath(treeElements);
      let editorValue = '';
      let selectedFilePath: string | null = null;

      if (firstFile) {
        editorValue = await wc.fs.readFile(firstFile, 'utf-8');
        selectedFilePath = firstFile;
      }

      set({
        webcontainer: wc,
        bootStatus: 'ready',
        bootError: null,
        treeElements,
        treeRevision: 0,
        selectedFilePath,
        editorValue,
        isDirty: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start editor environment';
      set({
        webcontainer: null,
        bootStatus: 'error',
        bootError: message,
        treeElements: [],
        treeRevision: 0,
        selectedFilePath: null,
        editorValue: '',
        isDirty: false,
      });
    }
  },

  refreshTreeFromFs: async () => {
    const { webcontainer, bootStatus } = get();
    if (!webcontainer || bootStatus !== 'ready') return;
    const treeRoot = await readFsTree(webcontainer.fs, '.');
    const treeElements = fileSystemTreeToViewElements(treeRoot);
    set((s) => ({
      treeElements,
      treeRevision: s.treeRevision + 1,
    }));
  },

  flushOpenFile: async () => {
    const { webcontainer, selectedFilePath, editorValue, isDirty } = get();
    if (!webcontainer || !selectedFilePath || !isDirty) return false;
    await webcontainer.fs.writeFile(selectedFilePath, editorValue, 'utf-8');
    set({ isDirty: false });
    return true;
  },

  save: async () => {
    try {
      const wrote = await get().flushOpenFile();
      return wrote ? 'written' : 'noop';
    } catch {
      return 'error';
    }
  },

  selectTreeId: async (id: string) => {
    if (id.startsWith(FOLDER_ID_PREFIX)) return;

    await get().flushOpenFile();

    const { webcontainer } = get();
    if (!webcontainer) return;

    try {
      const text = await webcontainer.fs.readFile(id, 'utf-8');
      set({
        selectedFilePath: id,
        editorValue: text,
        isDirty: false,
      });
    } catch {
      /* not a readable file path */
    }
  },

  setEditorValue: (value: string) => {
    const { editorValue } = get();
    if (value === editorValue) return;
    set({ editorValue: value, isDirty: true });
  },

  createFile: async (rawPath: string) => {
    await get().flushOpenFile();
    const { webcontainer, bootStatus } = get();
    if (!webcontainer || bootStatus !== 'ready') {
      throw new Error('Editor environment is not ready');
    }

    const path = normalizeEditorPath(rawPath);

    const openPathInTree = async () => {
      const treeRoot = await readFsTree(webcontainer.fs, '.');
      const nextTree = fileSystemTreeToViewElements(treeRoot);
      const text = await webcontainer.fs.readFile(path, 'utf-8');
      set((s) => ({
        treeElements: nextTree,
        treeRevision: s.treeRevision + 1,
        selectedFilePath: path,
        editorValue: text,
        isDirty: false,
      }));
    };

    try {
      await webcontainer.fs.readFile(path, 'utf-8');
      await openPathInTree();
      return 'opened';
    } catch {
      /* file does not exist — create */
    }

    try {
      await ensureParentDirs(webcontainer.fs, path);
      await webcontainer.fs.writeFile(path, '', 'utf-8');
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : 'Could not create file');
    }
    await openPathInTree();
    return 'created';
  },

  createFolder: async (rawPath: string) => {
    const { webcontainer, bootStatus } = get();
    if (!webcontainer || bootStatus !== 'ready') return;
    const path = normalizeEditorPath(rawPath);
    try {
      await webcontainer.fs.mkdir(path, { recursive: true });
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : 'Could not create folder');
    }
    await get().refreshTreeFromFs();
  },

  renamePath: async (oldPath: string, newPath: string) => {
    const { webcontainer, bootStatus, selectedFilePath } = get();
    if (!webcontainer || bootStatus !== 'ready') return;
    const from = normalizeEditorPath(oldPath);
    const to = normalizeEditorPath(newPath);
    await get().flushOpenFile();
    try {
      // @webcontainer/api supports fs.rename in recent versions
      const fsAny = webcontainer.fs as any;
      if (typeof fsAny.rename === 'function') {
        await fsAny.rename(from, to);
      } else {
        throw new Error('Rename is not supported in this environment');
      }
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : 'Could not rename');
    }
    await get().refreshTreeFromFs();
    if (
      selectedFilePath &&
      (selectedFilePath === from || selectedFilePath.startsWith(`${from}/`))
    ) {
      set({ selectedFilePath: null, editorValue: '', isDirty: false });
    }
  },

  deletePath: async (path: string) => {
    const { webcontainer, bootStatus, selectedFilePath } = get();
    if (!webcontainer || bootStatus !== 'ready') return;
    const p = normalizeEditorPath(path);
    await get().flushOpenFile();
    try {
      const fsAny = webcontainer.fs as any;
      if (typeof fsAny.rm === 'function') {
        await fsAny.rm(p, { recursive: true, force: true });
      } else if (typeof fsAny.unlink === 'function') {
        await fsAny.unlink(p);
      } else {
        throw new Error('Delete is not supported in this environment');
      }
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : 'Could not delete');
    }
    await get().refreshTreeFromFs();
    if (selectedFilePath && (selectedFilePath === p || selectedFilePath.startsWith(`${p}/`))) {
      set({ selectedFilePath: null, editorValue: '', isDirty: false });
    }
  },

  replaceWorkspace: async (tree: FileSystemTree) => {
    const { webcontainer, bootStatus } = get();
    if (!webcontainer || bootStatus !== 'ready') return;

    await get().flushOpenFile();

    // Clear workdir without deleting "."
    const fsAny = webcontainer.fs as any;
    try {
      const entries = await webcontainer.fs.readdir('.', { withFileTypes: true });
      for (const ent of entries) {
        const name =
          typeof ent.name === 'string'
            ? ent.name
            : new TextDecoder().decode(ent.name as Uint8Array);
        if (!name || name === '.' || name === '..') continue;
        try {
          if (typeof fsAny.rm === 'function') {
            await fsAny.rm(name, { recursive: true, force: true });
          } else if (ent.isDirectory?.()) {
            // fallback
            await fsAny.rmdir?.(name, { recursive: true });
          } else {
            await fsAny.unlink?.(name);
          }
        } catch {
          /* best-effort cleanup */
        }
      }
    } catch {
      /* ignore */
    }

    await webcontainer.mount(tree);

    const treeRoot = await readFsTree(webcontainer.fs, '.');
    const treeElements = fileSystemTreeToViewElements(treeRoot);
    const firstFile = pickDefaultFilePath(treeElements) ?? null;
    let editorValue = '';
    if (firstFile) {
      try {
        editorValue = await webcontainer.fs.readFile(firstFile, 'utf-8');
      } catch {
        editorValue = '';
      }
    }

    set((s) => ({
      treeElements,
      treeRevision: s.treeRevision + 1,
      selectedFilePath: firstFile,
      editorValue,
      isDirty: false,
    }));
  },
}));

const FS_WATCH_DEBOUNCE_MS = 300;

/**
 * Subscribes to WebContainer filesystem changes (terminal commands, npm, etc.) and
 * invokes `onFilesystemChange` after a short debounce. Uses recursive `fs.watch`
 * on the workdir when supported; otherwise root watch plus a light polling fallback.
 */
export function subscribeWebContainerFilesystem(
  wc: WebContainer,
  onFilesystemChange: () => void,
): () => void {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  const schedule = () => {
    if (debounceTimer !== null) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      onFilesystemChange();
    }, FS_WATCH_DEBOUNCE_MS);
  };

  const watchers: Array<{ close(): void }> = [];
  let pollId: ReturnType<typeof setInterval> | null = null;

  try {
    watchers.push(wc.fs.watch('.', { recursive: true }, () => schedule()));
  } catch {
    try {
      watchers.push(wc.fs.watch('.', () => schedule()));
    } catch {
      /* watch unavailable */
    }
    pollId = setInterval(() => schedule(), 3500);
  }

  return () => {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    if (pollId !== null) {
      clearInterval(pollId);
      pollId = null;
    }
    for (const w of watchers) {
      try {
        w.close();
      } catch {
        /* */
      }
    }
  };
}
