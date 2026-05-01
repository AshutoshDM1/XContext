'use client';

import * as React from 'react';
import { format, startOfDay } from 'date-fns';
import { CalendarBlankIcon } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function dateToTimeValue(date: Date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function setTime(date: Date, time: string) {
  const [hh, mm] = time.split(':').map((v) => Number(v));
  const next = new Date(date);
  next.setHours(Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0, 0, 0);
  return next;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Pick date & time',
  disabled,
  clearable = true,
  disablePastDates = true,
}: {
  value?: Date | null;
  onChange: (value: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  disablePastDates?: boolean;
}) {
  const selectedDate = value ?? undefined;
  const timeValue = React.useMemo(
    () => (selectedDate ? dateToTimeValue(selectedDate) : '12:00'),
    [selectedDate],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="w-full justify-start gap-2 px-2.5 font-normal"
        >
          <CalendarBlankIcon className="size-4 text-muted-foreground" />
          {selectedDate ? (
            <span className="truncate">{format(selectedDate, 'PPP p')}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-2.5">
        <div className="flex flex-col gap-2.5">
          <Calendar
            mode="single"
            selected={selectedDate}
            disabled={disablePastDates ? (date) => date < startOfDay(new Date()) : undefined}
            onSelect={(d) => {
              if (!d) return;
              onChange(setTime(d, timeValue));
            }}
            initialFocus
          />

          <div className="flex items-center gap-2">
            <Input
              type="time"
              value={timeValue}
              onChange={(e) => {
                const t = e.target.value;
                if (!selectedDate) {
                  onChange(setTime(new Date(), t));
                  return;
                }
                onChange(setTime(selectedDate, t));
              }}
            />
            {clearable ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || !selectedDate}
                onClick={() => onChange(null)}
              >
                Clear
              </Button>
            ) : null}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
