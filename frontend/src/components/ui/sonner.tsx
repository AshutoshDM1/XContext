'use client';

import type { CSSProperties } from 'react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import {
  CheckCircleIcon,
  InfoIcon,
  WarningIcon,
  XCircleIcon,
  SpinnerIcon,
} from '@phosphor-icons/react';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster"
      icons={{
        success: <CheckCircleIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <WarningIcon className="size-4" />,
        error: <XCircleIcon className="size-4" />,
        loading: <SpinnerIcon className="size-4 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'hsl(var(--background))',
          '--normal-text': 'hsl(var(--foreground))',
          '--normal-border': 'hsl(var(--border))',
          '--success-bg': 'hsl(var(--background))',
          '--success-text': 'hsl(var(--foreground))',
          '--success-border': 'hsl(var(--border))',
          '--error-bg': 'hsl(var(--background))',
          '--error-text': 'hsl(var(--foreground))',
          '--error-border': 'hsl(var(--border))',
          '--warning-bg': 'hsl(var(--background))',
          '--warning-text': 'hsl(var(--foreground))',
          '--warning-border': 'hsl(var(--border))',
          '--info-bg': 'hsl(var(--background))',
          '--info-text': 'hsl(var(--foreground))',
          '--info-border': 'hsl(var(--border))',
          '--border-radius': 'var(--radius)',
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            'group pointer-events-auto flex w-full items-start gap-3 rounded-none border-2 border-white bg-background/95 px-4 py-3 text-foreground shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80',
          title: 'text-sm font-medium leading-snug',
          description: 'text-xs text-muted-foreground leading-relaxed',
          icon: 'mt-0.5 text-muted-foreground',
          closeButton:
            'rounded-none border border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
          actionButton:
            'rounded-none bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:bg-foreground/90',
          cancelButton:
            'rounded-none border border-border bg-transparent px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
