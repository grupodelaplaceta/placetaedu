
import React from 'react';
import { Clock, GraduationCap, Users, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import CountdownTimer from './CountdownTimer';
import { Link } from 'react-router-dom';

export interface Course {
  id: number;
  emoji: string;
  cat: string;
  catLabel: string;
  title: string;
  desc: string;
  duration: string;
  level: string;
  institution: string;
  plazas: number;
  isHidden?: boolean;
  enrollStart?: string;
  enrollEnd?: string;
  provider?: string;
  learningPoints?: string[];
  requirements?: string[];
  fullDesc?: string;
  callNumber?: string;
  courseStart?: string;
  courseEnd?: string;
  syllabusUrl?: string;
  badgeUrl?: string;
}

interface Props {
  course: Course;
  onEnroll: (course: Course) => void;
  key?: React.Key;
}

export default function CourseCard({ course, onEnroll }: Props) {
  const catStyles: Record<string, string> = {
    tech: 'bg-blue-50 text-blue-600 border-blue-100',
    data: 'bg-purple-50 text-purple-600 border-purple-100',
    business: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    design: 'bg-pink-50 text-pink-600 border-pink-100',
    idiomas: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  const isEnrollActive = React.useMemo(() => {
    if (!course.enrollStart || !course.enrollEnd) return true; // Default to active if dates missing
    const now = new Date().getTime();
    return now >= new Date(course.enrollStart).getTime() && now <= new Date(course.enrollEnd).getTime();
  }, [course]);

  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col h-full transition-all group border border-slate-200 shadow-sm hover:shadow-lg">
      <div className="p-5 pb-4 flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <span className="text-3xl">{course.emoji}</span>
          <span className={cn(
            "text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-lg border",
            catStyles[course.cat] || 'bg-slate-50'
          )}>
            {course.catLabel}
          </span>
        </div>
        {course.callNumber && (
          <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">
            Convocatoria {course.callNumber}
          </div>
        )}
        <h3 className="text-base font-black text-slate-900 leading-tight mb-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed font-medium">
          {course.desc}
        </p>

        {course.enrollStart && course.enrollEnd && (
          <div className="mb-4 -mx-1">
            <CountdownTimer startDate={course.enrollStart} endDate={course.enrollEnd} compact />
          </div>
        )}
        
        <div className="flex flex-wrap gap-3 text-[11px] font-bold text-slate-400 mt-auto">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {course.duration}
          </div>
          <div className="flex items-center gap-1">
            <GraduationCap className="w-3 h-3" /> {course.institution}
          </div>
        </div>
      </div>
      
      <div className="mt-auto border-t border-slate-100 p-4 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
            {course.level}
          </span>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
             <Users className="w-3 h-3" /> {course.plazas}
          </div>
          <Link 
            to={`/cursos/${course.id}`}
            className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline ml-2"
          >
            <Info className="w-3 h-3" /> Detalles
          </Link>
        </div>
        <button 
          onClick={() => onEnroll(course)}
          className="text-xs font-black text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
        >
          Solicitar
        </button>
      </div>
    </div>
  );
}
