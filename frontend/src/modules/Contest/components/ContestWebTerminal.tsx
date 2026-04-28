'use client';

import { FitAddon } from '@xterm/addon-fit';
import { Terminal, type IDisposable } from '@xterm/xterm';
import { useEffect, useRef } from 'react';
import type { WebContainerProcess } from '@webcontainer/api';
import { useCodeEditorStore } from '@/store/codeEditor';

import '@xterm/xterm/css/xterm.css';

export function ContestWebTerminal() {
  const bootStatus = useCodeEditorStore((s) => s.bootStatus);
  const webcontainer = useCodeEditorStore((s) => s.webcontainer);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bootStatus !== 'ready' || !webcontainer || !containerRef.current) {
      return undefined;
    }

    const container = containerRef.current;
    let cancelled = false;
    let proc: WebContainerProcess | null = null;
    const disposables: IDisposable[] = [];
    let resizeObserver: ResizeObserver | null = null;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 12,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      theme: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        cursor: 'hsl(var(--foreground))',
      },
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(container);
    fitAddon.fit();

    void (async () => {
      try {
        proc = await webcontainer.spawn('jsh', {
          terminal: {
            cols: term.cols,
            rows: term.rows,
          },
        });
      } catch (e) {
        if (!cancelled) {
          term.writeln(
            `\r\n\x1b[31mCould not start shell: ${e instanceof Error ? e.message : String(e)}\x1b[0m\r\n`,
          );
        }
        return;
      }

      if (cancelled) {
        proc?.kill();
        proc = null;
        return;
      }

      const inputWriter = proc.input.getWriter();

      disposables.push(
        term.onData((d) => {
          void inputWriter.write(d).catch(() => {});
        }),
      );

      const outputReader = proc.output.getReader();
      void (async () => {
        try {
          while (!cancelled) {
            const { done, value } = await outputReader.read();
            if (done) break;
            if (!cancelled) term.write(value);
          }
        } finally {
          try {
            outputReader.releaseLock();
          } catch {
            /* */
          }
        }
      })();

      const fitAndSyncProcess = () => {
        fitAddon.fit();
        try {
          proc?.resize({ cols: term.cols, rows: term.rows });
        } catch {
          /* */
        }
      };

      resizeObserver = new ResizeObserver(() => {
        if (!cancelled) fitAndSyncProcess();
      });
      resizeObserver.observe(container);

      disposables.push(
        term.onResize(({ cols, rows }) => {
          if (!cancelled && proc) {
            try {
              proc.resize({ cols, rows });
            } catch {
              /* */
            }
          }
        }),
      );

      if (!cancelled) {
        term.focus();
      }
    })();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      for (const d of disposables) {
        d.dispose();
      }
      proc?.kill();
      proc = null;
      term.dispose();
    };
  }, [bootStatus, webcontainer]);

  if (bootStatus !== 'ready') {
    return (
      <div className="flex flex-1 items-center justify-center border-t bg-background px-3 py-2 text-xs text-muted-foreground">
        Terminal is available when the environment is ready.
      </div>
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col border-t bg-background">
      <div className="shrink-0 border-b px-2 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Terminal
      </div>
      <div ref={containerRef} className="min-h-0 min-w-0 flex-1 overflow-hidden p-1" />
    </div>
  );
}
