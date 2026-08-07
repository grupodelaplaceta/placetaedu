import React, { useEffect, useState } from 'react';
import { format, eachMonthOfInterval, min, max, isBefore, isAfter, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, startOfDay, endOfDay, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { BookOpen, AlertCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Course } from '../components/CourseCard';

interface ColorScheme {
  bg: string; bgLight: string; text: string; border: string;
}

interface CalendarEvent {
  id: string;
  courseTitle: string;
  type: 'enrollment' | 'course';
  start: Date;
  end: Date;
  colorScheme: ColorScheme;
}

export default function Calendar() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/courses')
      .then(r => { if (!r.ok) throw new Error('API Error'); return r.json(); })
      .then(data => {
        setCourses(data.filter((c: any) => !c.isHidden));
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading courses", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-24 flex items-center justify-center text-center text-slate-400 font-bold tracking-widest uppercase text-sm">Cargando calendario...</div>;
  }

  const events: CalendarEvent[] = [];
  const colorSchemes: ColorScheme[] = [
    { bg: 'bg-indigo-500', bgLight: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-400' },
    { bg: 'bg-emerald-500', bgLight: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-400' },
    { bg: 'bg-rose-500', bgLight: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-400' },
    { bg: 'bg-amber-500', bgLight: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-400' },
    { bg: 'bg-cyan-500', bgLight: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-400' },
    { bg: 'bg-purple-500', bgLight: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-400' },
    { bg: 'bg-orange-500', bgLight: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-400' },
    { bg: 'bg-pink-500', bgLight: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-400' },
  ];
  
  courses.forEach((c, index) => {
    const colorScheme = colorSchemes[index % colorSchemes.length];
    if (c.enrollStart && c.enrollEnd) {
      events.push({
        id: `enroll-${c.id}`,
        courseTitle: c.title,
        type: 'enrollment',
        start: new Date(c.enrollStart),
        end: new Date(c.enrollEnd),
        colorScheme: colorScheme
      });
    }
    if (c.courseStart && c.courseEnd) {
      events.push({
        id: `course-${c.id}`,
        courseTitle: c.title,
        type: 'course',
        start: new Date(c.courseStart),
        end: new Date(c.courseEnd),
        colorScheme: colorScheme
      });
    }
  });

  if (events.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-2">No hay eventos</h2>
        <p className="text-slate-500">No hay fechas configuradas para los cursos activos.</p>
      </div>
    );
  }

  const allDates = events.flatMap(e => [e.start, e.end]);
  const minDate = min(allDates);
  const maxDate = max(allDates);

  const months = eachMonthOfInterval({ start: minDate, end: maxDate });
  const weekDays = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      <div className="bg-ink border-b border-white/10 pt-16 pb-20 mb-8 rounded-b-[40px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight flex items-center gap-4">
              <CalendarIcon className="w-10 h-10 text-primary" />
              Calendario <span className="text-primary italic font-serif font-light">Lectivo</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed font-medium">
              Planifica tu año académico. Vista mensual detallada de las fechas de preinscripción y duración de los programas.
            </p>
          </div>
        </div>
      </div>

      <div className="-mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full relative z-10">
        <div className="bg-white p-6 rounded-[24px] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
          <div className="flex flex-wrap gap-2 md:gap-3 items-center">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Leyenda de Programas</div>
            {courses.map((c, idx) => (
               <div key={c.id} className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl font-bold text-slate-700 transition-colors hover:bg-slate-100">
                 <div className={`w-2.5 h-2.5 rounded-full ${colorSchemes[idx % colorSchemes.length].bg}`}></div>
                 <span>{c.title}</span>
               </div>
            ))}
          </div>
          <div className="flex items-center flex-wrap gap-4 text-xs font-bold text-slate-600 bg-slate-50 px-5 py-3 rounded-xl border border-slate-100">
             <div className="flex items-center gap-2">
               <div className="w-6 h-4 bg-slate-50 border border-dashed border-slate-400 rounded"></div> 
               Preinscripción
             </div>
             <div className="flex items-center gap-2">
               <div className="w-6 h-4 bg-slate-400 rounded"></div> 
               Curso Activo
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 w-full space-y-16">
        {months.map(monthDate => {
          const mStart = startOfMonth(monthDate);
          const mEnd = endOfMonth(monthDate);
          
          const startDate = startOfWeek(mStart, { weekStartsOn: 1 });
          const endDate = endOfWeek(mEnd, { weekStartsOn: 1 });
          const days = eachDayOfInterval({ start: startDate, end: endDate });

          const gridEvents = events
            .filter(e => isBefore(e.start, endDate) && isAfter(e.end, startDate))
            .sort((a, b) => a.start.getTime() - b.start.getTime());

          // Assign fixed lanes for continuous events in the grid
          const eventLaneMap = new Map<string, number>();
          const lanes: CalendarEvent[][] = [];
          gridEvents.forEach(e => {
            let placed = false;
            for (let i = 0; i < lanes.length; i++) {
              const overlap = lanes[i].some(laneEvent =>
                isBefore(e.start, addDays(laneEvent.end, 1)) && isAfter(e.end, subDays(laneEvent.start, 1))
              );
              if (!overlap) {
                lanes[i].push(e);
                eventLaneMap.set(e.id, i);
                placed = true;
                break;
              }
            }
            if (!placed) {
              lanes.push([e]);
              eventLaneMap.set(e.id, lanes.length - 1);
            }
          });
          const maxLanes = lanes.length;

          return (
            <div key={monthDate.toISOString()} className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 md:p-8 flex items-baseline gap-3 border-b border-slate-100">
                <h3 className="text-3xl md:text-4xl font-black capitalize tracking-tight text-slate-900">
                  {format(monthDate, 'MMMM', { locale: es })}
                </h3>
                <span className="text-xl md:text-2xl font-bold text-slate-300 tracking-wider">
                  {format(monthDate, 'yyyy', { locale: es })}
                </span>
              </div>
              
              <div className="p-1 md:p-4 bg-slate-50/50">
                <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden shadow-inner">
                  {weekDays.map(day => (
                    <div key={day} className="bg-white py-4 text-center text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">
                      {day}
                    </div>
                  ))}
                  
                  {days.map(day => {
                    const isCurrentMonth = isSameMonth(day, monthDate);
                    const isToday = isSameDay(day, new Date());
                    
                    return (
                      <div 
                        key={day.toISOString()} 
                        className={`min-h-[120px] bg-white flex flex-col overflow-hidden ${!isCurrentMonth ? 'opacity-40 bg-slate-50/50' : ''}`}
                      >
                        <div className="flex justify-end p-2 relative z-20">
                          <div className={`text-xs sm:text-sm font-bold flex items-center justify-center ${isToday ? 'w-7 h-7 bg-primary text-white rounded-full shadow-md shadow-primary/30' : 'text-slate-500 w-7 h-7'}`}>
                            {format(day, 'd')}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-1 w-full pb-2 relative z-10 grow">
                          {Array.from({ length: maxLanes }).map((_, laneIndex) => {
                            const e = gridEvents.find(ev => eventLaneMap.get(ev.id) === laneIndex && isWithinInterval(day, { start: startOfDay(ev.start), end: endOfDay(ev.end) }));

                            if (!e) {
                              return <div key={`empty-${laneIndex}`} className="h-[22px] sm:h-[26px]"></div>;
                            }

                            const isActualEventStart = isSameDay(day, e.start);
                            const isStart = isActualEventStart || day.getDay() === 1 || isSameDay(day, startDate);
                            const isEnd = isSameDay(day, e.end) || day.getDay() === 0 || isSameDay(day, endDate);

                            const isEnrollment = e.type === 'enrollment';
                            const c = e.colorScheme;
                            
                            let cl = `h-[22px] sm:h-[26px] flex items-center relative transition-all text-[9.5px] sm:text-[11px] font-bold px-2 group`;
                            
                            if (isEnrollment) {
                              cl += ` ${c.bgLight} ${c.text} border-y border-dashed ${c.border}`;
                              if (isStart) cl += ` border-l rounded-l-md ml-1`;
                              if (isEnd) cl += ` border-r rounded-r-md mr-1`;
                            } else {
                              cl += ` ${c.bg} text-white`;
                              if (isStart) cl += ` rounded-l-md ml-1 shadow-sm`;
                              if (isEnd) cl += ` rounded-r-md mr-1`;
                            }

                            return (
                              <div key={e.id} className={cl} title={`${isEnrollment ? 'Preinscripción: ' : 'Curso: '}${e.courseTitle}`}>
                                {isStart && (
                                  <span className="truncate drop-shadow-sm pointer-events-none sticky left-2 pr-2">
                                    {isEnrollment ? `✍️ ${e.courseTitle}` : e.courseTitle}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
