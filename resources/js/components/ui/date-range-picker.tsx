import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const PRESETS = [
  { label: 'Today', getValue: () => ({ from: new Date(), to: new Date() }) },
  {
    label: 'Last 7 days',
    getValue: () => ({ from: new Date(Date.now() - 6 * 86400000), to: new Date() }),
  },
  {
    label: 'Last 30 days',
    getValue: () => ({ from: new Date(Date.now() - 29 * 86400000), to: new Date() }),
  },
  {
    label: 'Last 90 days',
    getValue: () => ({ from: new Date(Date.now() - 89 * 86400000), to: new Date() }),
  },
];

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const displayText = value?.from
    ? value.to
      ? `${format(value.from, 'MMM d, yyyy')} - ${format(value.to, 'MMM d, yyyy')}`
      : format(value.from, 'MMM d, yyyy')
    : 'Pick a date range';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex border-b border-border-subtle">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                onChange(preset.getValue());
                setOpen(false);
              }}
              className="flex-1 px-3 py-2 text-xs font-medium text-text-muted hover:bg-surface hover:text-text-primary transition-colors first:rounded-tl-md last:rounded-tr-md"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          numberOfMonths={2}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
