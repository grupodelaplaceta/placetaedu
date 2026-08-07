import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { SCHEDULE_SLOTS } from '../lib/data';
import { cn } from '../lib/utils';

interface Props {
  value: string;
  onChange: (id: string) => void;
  preview?: boolean; // modo informativo (sin interacción)
  compact?: boolean; // variante compacta para paneles estrechos (ej. admin)
}

export default function ScheduleSlotPicker({ value, onChange, preview, compact }: Props) {
  return (
    <div className={cn(
      "grid gap-2.5",
      compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    )}>
      {SCHEDULE_SLOTS.map(slot => {
        const selected = value === slot.id;
        const content = (
          <div className="flex items-start gap-2.5">
            <span className={cn(
              "rounded-xl flex items-center justify-center shrink-0 border",
              compact ? "w-9 h-9 text-lg" : "w-10 h-10 text-xl",
              slot.chip
            )}>
              {slot.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className={cn("font-black text-slate-900 leading-tight", compact ? "text-xs" : "text-sm")}>{slot.nombre}</span>
                {slot.id === 'flexible' && (
                  <Sparkles className="w-3 h-3 text-[#b9973f]" />
                )}
              </div>
              <div className="text-[10px] font-bold text-slate-500 mt-0.5 leading-snug">{slot.dias}</div>
              {!compact && <div className="text-[10px] font-black text-primary mt-0.5">{slot.hora}</div>}
            </div>
            {!preview && (
              <span className={cn(
                "ml-auto mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                selected ? "bg-primary border-primary text-white scale-110" : "border-slate-200 text-transparent"
              )}>
                <Check className="w-3 h-3" strokeWidth={3} />
              </span>
            )}
          </div>
        );

        if (preview) {
          return (
            <div
              key={slot.id}
              className={cn(
                "text-left rounded-2xl border-2 border-slate-100 bg-white cursor-default hover:border-slate-200 hover:shadow-md transition-all",
                compact ? "p-3" : "p-3.5"
              )}
            >
              {content}
            </div>
          );
        }

        return (
          <button
            type="button"
            key={slot.id}
            onClick={() => onChange(slot.id)}
            className={cn(
              "text-left rounded-2xl border-2 transition-all group",
              compact ? "p-3" : "p-3.5",
              selected
                ? cn("border-transparent shadow-lg ring-2", slot.ring)
                : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
            )}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
