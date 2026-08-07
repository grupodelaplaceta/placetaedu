import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

type TimerState = 'upcoming' | 'active' | 'ended';

interface Props {
  startDate: string;
  endDate: string;
  compact?: boolean;
}

export default function CountdownTimer({ startDate, endDate, compact }: Props) {
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [status, setStatus] = React.useState<TimerState>('upcoming');

  const START_DATE = new Date(startDate).getTime();
  const END_DATE = new Date(endDate).getTime();

  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      
      let targetDate = START_DATE;
      let currentStatus: TimerState = 'upcoming';

      if (now >= START_DATE && now <= END_DATE) {
        targetDate = END_DATE;
        currentStatus = 'active';
      } else if (now > END_DATE) {
        currentStatus = 'ended';
      }

      setStatus(currentStatus);

      if (currentStatus === 'ended') {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const distance = targetDate - now;
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [START_DATE, END_DATE]);

  if (status === 'ended') {
    return (
      <div className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200",
        compact && "w-full justify-center mb-4"
      )}>
        <AlertCircle className="w-3 h-3 text-slate-400" />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Plazo Finalizado</span>
      </div>
    );
  }

  const isUrgent = status === 'active' && timeLeft.days === 0;

  return (
    <div className={cn(
      "bg-white border rounded-xl overflow-hidden transition-all duration-300",
      isUrgent ? "border-amber-200 bg-amber-50/10 shadow-amber-100/20" : "border-slate-200 shadow-sm",
      compact ? "p-3 mb-4" : "p-4 w-full mb-6"
    )}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-primary"
          )} />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {status === 'active' ? 'CIERRE DE PRE-INSCRIPCIÓN' : 'APERTURA DE CONVOCATORIA'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 font-mono">
          <div className="flex items-baseline gap-0.5">
            <span className={cn(
              "text-sm font-black tabular-nums",
              isUrgent ? "text-amber-600" : "text-slate-900"
            )}>
              {timeLeft.days}
            </span>
            <span className="text-[8px] font-bold text-slate-400 uppercase">d</span>
          </div>
          <span className="text-slate-200 font-bold">:</span>
          <div className="flex items-baseline gap-0.5">
            <span className={cn(
              "text-sm font-black tabular-nums",
              isUrgent ? "text-amber-600" : "text-slate-900"
            )}>
              {timeLeft.hours.toString().padStart(2, '0')}
            </span>
            <span className="text-[8px] font-bold text-slate-400 uppercase">h</span>
          </div>
          <span className="text-slate-200 font-bold">:</span>
          <div className="flex items-baseline gap-0.5">
            <span className={cn(
              "text-sm font-black tabular-nums",
              isUrgent ? "text-amber-600" : "text-slate-900"
            )}>
              {timeLeft.minutes.toString().padStart(2, '0')}
            </span>
            <span className="text-[8px] font-bold text-slate-400 uppercase">m</span>
          </div>
        </div>
      </div>
      
      {!compact && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">
            {status === 'active' ? 'Vence el:' : 'Disponible el:'}
          </span>
          <span className="text-[9px] font-black text-slate-600 tabular-nums">
            {new Date(status === 'active' ? END_DATE : START_DATE).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      )}
    </div>
  );
}
