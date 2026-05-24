'use client';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme } = useTheme();
  const { theme } = useTheme();
  return (
    <div className="fixed bottom-4 right-4">
      <Button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className={cn('cursor-pointer', className)}
        size="icon"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      </Button>
    </div>
  );
}
