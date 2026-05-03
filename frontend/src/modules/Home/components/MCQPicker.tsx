'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export type MCQOption = {
  id: string;
  label: string;
  description?: string;
};

export function MCQPicker(props: {
  title: string;
  description?: string;
  options: MCQOption[];
  value: string[];
  onChange: (next: string[]) => void;
  multiple?: boolean;
  className?: string;
}) {
  const { title, description, options, value, onChange, multiple = false, className } = props;

  const toggle = (id: string) => {
    if (multiple) {
      const next = value.includes(id) ? value.filter((v) => v !== id) : [...value, id];
      onChange(next);
      return;
    }

    onChange(value[0] === id ? [] : [id]);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="space-y-1">
        <div className="text-xs font-medium text-foreground">{title}</div>
        {description ? <div className="text-xs text-muted-foreground">{description}</div> : null}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((o) => {
          const selected = value.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => toggle(o.id)}
              className={cn(
                'group flex w-full items-start gap-3 rounded-none border px-3 py-2 text-left',
                'transition-colors hover:bg-muted/40',
                selected ? 'border-primary bg-primary/5' : 'border-border bg-transparent',
              )}
            >
              <span className="pt-0.5">
                {multiple ? (
                  <Checkbox checked={selected} onCheckedChange={() => toggle(o.id)} />
                ) : (
                  <span
                    className={cn(
                      'mt-0.5 block size-4 rounded-full border',
                      selected ? 'border-primary bg-primary' : 'border-border bg-transparent',
                    )}
                    aria-hidden
                  />
                )}
              </span>
              <span className="min-w-0 flex-1 space-y-0.5">
                <span className="block text-xs font-medium text-foreground">{o.label}</span>
                {o.description ? (
                  <span className="block text-xs text-muted-foreground">{o.description}</span>
                ) : null}
              </span>
              {selected ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="pointer-events-none ml-auto opacity-0 group-hover:opacity-100"
                >
                  Selected
                </Button>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
