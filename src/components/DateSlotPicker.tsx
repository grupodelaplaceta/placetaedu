import React from 'react';
import { Check, CalendarDays } from 'lucide-react';
import { formatDiaSemana, formatFechaLarga } from '../lib/data';
import { cn } from '../lib/utils';

interface Props {
  dates: string[];       // fechas concretas disponibles (YYYY-MM-DD)
  value: string;         // fecha seleccionada
  onChange: (iso: string) => void;
  preview?: boolean;     // modo informativo (sin interacción)
  compact?: boolean;     // variante compacta para paneles estrechos (ej. admin)
}

function parse(iso: string): Date | null {
  const d = new Date(String(iso).slice(0, 10) + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

export default function DateSlotPicker({ dates, value, onChange, preview, compact }: Props) {
  const lista = [...(dates || [])].filter(Boolean).sort();

  if (lista.length === 0) {
    return (
      <div className="flex items-center gap-3 bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4">
        <CalendarDays className="w-5 h-5 text-slate-400 shrink-0" />
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Este curso aún no tiene días concretos disponibles. La administración publicará las fechas próximamente.
        </p>
      </div>
    );
  }

  return (
    <div className={cn(
      "grid gap-2.5",
      compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    )}>
      {lista.map(iso => {
        const d = parse(iso);
        if (!d) return null;
        const selected = value === iso;
        const mes = d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');

        const content = (
          <div className="flex items-center gap-3">
            <div className={cn(
              "rounded-xl flex flex-col items-center justify-center shrink-0 border bg-[#f1eafb] text-[#6321a5] border-[#e2d4f5]",
              compact ? "w-11 h-11" : "w-12 h-12"
            )}>
              <span className={cn("font-black leading-none", compact ? "text-base" : "text-lg")}>{d.getDate()}</span>
              <span className="text-[7px] uppercase font-bold leading-tight">{mes}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className={cn("font-black text-slate-900 leading-tight capitalize", compact ? "text-xs" : "text-sm")}>
                {formatDiaSemana(iso)}
              </div>
              <div className="text-[10px] font-bold text-slate-500 mt-0.5 leading-snug">
                {formatFechaLarga(iso)}
              </div>
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
              key={iso}
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
            key={iso}
            onClick={() => onChange(iso)}
            className={cn(
              "text-left rounded-2xl border-2 transition-all group",
              compact ? "p-3" : "p-3.5",
              selected
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
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
