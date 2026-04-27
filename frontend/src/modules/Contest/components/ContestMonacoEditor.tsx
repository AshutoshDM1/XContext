'use client';

import Editor from '@monaco-editor/react';
import { useCallback, useMemo } from 'react';
import type { editor } from 'monaco-editor';

const CONTEST_MONACO_THEME_ID = 'contest-pure-black';

function languageFromPath(path: string): string {
  const i = path.lastIndexOf('.');
  const ext = i >= 0 ? path.slice(i).toLowerCase() : '';
  switch (ext) {
    case '.ts':
    case '.tsx':
      return 'typescript';
    case '.js':
    case '.jsx':
    case '.mjs':
    case '.cjs':
      return 'javascript';
    case '.json':
      return 'json';
    case '.css':
      return 'css';
    case '.html':
    case '.htm':
      return 'html';
    case '.md':
      return 'markdown';
    default:
      return 'plaintext';
  }
}

export type ContestMonacoEditorProps = {
  filePath: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
};

export function ContestMonacoEditor({
  filePath,
  value,
  onChange,
  onSave,
}: ContestMonacoEditorProps) {
  const language = useMemo(() => languageFromPath(filePath), [filePath]);

  const handleBeforeMount = useCallback((monaco: typeof import('monaco-editor')) => {
    monaco.editor.defineTheme(CONTEST_MONACO_THEME_ID, {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#000000',
        'editorGutter.background': '#000000',
        'editorPane.background': '#000000',
        'editorWidget.background': '#0a0a0a',
        'editorCursor.foreground': '#fafafa',
        'editor.lineHighlightBackground': '#141414',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41',
      },
    });
  }, []);

  const handleMount = useCallback(
    (ed: editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
      ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        onSave();
      });
    },
    [onSave],
  );

  return (
    <Editor
      key={filePath}
      height="100%"
      theme={CONTEST_MONACO_THEME_ID}
      path={filePath}
      language={language}
      value={value}
      onChange={(v) => onChange(v ?? '')}
      beforeMount={handleBeforeMount}
      onMount={handleMount}
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
        padding: { top: 8 },
        smoothScrolling: true,
      }}
    />
  );
}
