"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useT } from "@/components/i18n/LanguageProvider";
import { cn, formatDate } from "@/lib/utils";

type DatePickerProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
};

function toIsoDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function DatePicker({
  id,
  value,
  onChange,
  min,
}: DatePickerProps) {
  const t = useT();
  const locale = useLocale();
  const fallbackId = useId();
  const inputId = id ?? fallbackId;
  const rootRef = useRef<HTMLDivElement>(null);

  const minDate = min ? startOfDay(parseISO(min)) : startOfDay(new Date());
  const selected = value ? parseISO(value) : null;

  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() =>
    selected && !isBefore(selected, minDate) ? startOfMonth(selected) : startOfMonth(minDate)
  );

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const weekDays = eachDayOfInterval({
    start: gridStart,
    end: endOfWeek(gridStart, { weekStartsOn: 1 }),
  }).map((day) => formatDate(day, "EEEEE", locale));

  const displayValue = selected
    ? formatDate(selected, "MMMM d, yyyy", locale)
    : "";

  const pickDate = (day: Date) => {
    if (isBefore(day, minDate)) return;
    onChange(toIsoDate(day));
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={inputId}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm shadow-sm transition",
          "hover:border-amber-400/60 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20",
          open && "border-amber-500 ring-2 ring-amber-500/20"
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
          <CalendarDays size={18} aria-hidden />
        </span>
        <span className={cn("flex-1", !displayValue && "text-muted")}>
          {displayValue || t.booking.datePickerPlaceholder}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t.booking.preferredDate}
          className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-xl shadow-black/10 sm:right-auto sm:w-[min(100%,20rem)]"
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label={t.booking.datePickerPrevMonth}
              onClick={() => setViewMonth((m) => subMonths(m, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition hover:bg-surface-muted hover:text-foreground"
            >
              <ChevronLeft size={16} aria-hidden />
            </button>
            <p className="text-sm font-semibold">
              {formatDate(viewMonth, "MMMM yyyy", locale)}
            </p>
            <button
              type="button"
              aria-label={t.booking.datePickerNextMonth}
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition hover:bg-surface-muted hover:text-foreground"
            >
              <ChevronRight size={16} aria-hidden />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map((label) => (
              <span
                key={label}
                className="py-1 text-[11px] font-semibold uppercase tracking-wide text-muted"
              >
                {label}
              </span>
            ))}
            {days.map((day) => {
              const disabled = isBefore(day, minDate);
              const outside = !isSameMonth(day, viewMonth);
              const isSelected = selected ? isSameDay(day, selected) : false;
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => pickDate(day)}
                  aria-label={formatDate(day, "MMMM d, yyyy", locale)}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-sm transition",
                    outside && "text-muted/40",
                    !outside && !disabled && "hover:bg-surface-muted",
                    disabled && "cursor-not-allowed opacity-30",
                    isToday && !isSelected && "ring-1 ring-amber-400/50",
                    isSelected &&
                      "bg-amber-500 font-semibold text-slate-900 shadow-sm shadow-amber-500/25"
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
