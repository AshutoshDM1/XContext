'use client';

import { CaretLeftIcon, TrophyIcon } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export type ToolTopbarProps = {
  title: string;
  description: string;
};

const ToolTopbar = ({ title, description }: ToolTopbarProps) => {
  const router = useRouter();

  return (
    <header className="flex shrink-0 items-center justify-between gap-4 border-b bg-background px-3 py-3 text-foreground">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 shrink-0"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <CaretLeftIcon className="size-5" weight="bold" />
        </Button>
        <Separator orientation="vertical" className="h-10" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="hidden shrink-0 sm:inline-flex"
        onClick={() => {}}
      >
        <TrophyIcon className="size-4" />
        Leaderboard
      </Button>
    </header>
  );
};

export default ToolTopbar;
