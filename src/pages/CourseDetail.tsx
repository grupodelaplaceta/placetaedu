
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, GraduationCap, Users, ShieldCheck, CheckCircle2, Bookmark } from 'lucide-react';
import { type Course } from '../components/CourseCard';
import EnrollModal from '../components/EnrollModal';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = React.useState<Course | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [showEnroll, setShowEnroll] = React.useState(false);

  React.useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${id}`);
        if (res.ok) {
          const data = await res.json();
          setCourse(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-black text-slate-900 mb-4">Curso no encontrado</h2>
        <Link to="/cursos" className="text-primary font-bold hover:underline">Volver al catálogo</Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4">
        <Link to="/cursos" className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-primary transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Volver al catálogo
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-200 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="text-6xl">{course.emoji}</span>
                <div className="flex flex-col gap-1">
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100 w-fit">
                    {course.catLabel}
                  </span>
                  {course.callNumber && (
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      Convocatoria: {course.callNumber}
                    </span>
                  )}
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                {course.title}
              </h1>
              <p className="text-lg text-slate-500 font-medium leading-relaxed mb-8">
                {course.fullDesc || course.desc}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="space-y-1">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Duración</div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Clock className="w-4 h-4 text-primary" /> {course.duration}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nivel</div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <GraduationCap className="w-4 h-4 text-primary" /> {course.level}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Plazas</div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Users className="w-4 h-4 text-primary" /> {course.plazas}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Proveedor</div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-primary" /> {course.provider || course.institution}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {(course.enrollStart || course.enrollEnd) && (
                  <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                    <div className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1.5">Plazo de Preinscripción</div>
                    <div className="text-sm font-bold text-slate-700">
                      {course.enrollStart ? new Date(course.enrollStart).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'Pendiente'}
                      {' - '}
                      {course.enrollEnd ? new Date(course.enrollEnd).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'Pendiente'}
                    </div>
                  </div>
                )}
                {(course.courseStart || course.courseEnd) && (
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1.5">Fechas de la Beca</div>
                    <div className="text-sm font-bold text-slate-700">
                      {course.courseStart ? new Date(course.courseStart).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'Pendiente'}
                      {' - '}
                      {course.courseEnd ? new Date(course.courseEnd).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'Pendiente'}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <Bookmark className="w-6 h-6 text-primary" /> ¿Qué aprenderás?
                </h3>
                <ul className="space-y-4">
                  {(course.learningPoints || ['Contenidos oficiales del programa', 'Prácticas en entornos reales', 'Preparación para certificación']).map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-600 font-medium">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-primary" /> Requisitos
                </h3>
                <ul className="space-y-4">
                  {(course.requirements || ['Disponibilidad horaria', 'Conexión a internet estable', 'Interés por la materia']).map((req, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mt-2"></div>
                      <span className="text-sm text-slate-600 font-medium">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-ink rounded-[2rem] p-8 text-white sticky top-24 shadow-2xl shadow-primary/20"
            >
              <div className="mb-8">
                <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Estado de Beca</h4>
                <div className="text-2xl font-black mb-1">Solicitud Abierta</div>
                <div className="text-emerald-400 text-sm font-bold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  100% Subvencionado
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-slate-800 rounded-2xl flex items-center justify-between border border-slate-700/50">
                  <span className="text-xs font-bold text-slate-400">Total Beca</span>
                  <span className="text-sm font-black">Gratis</span>
                </div>
                <div className="p-4 bg-slate-800 rounded-2xl flex items-center justify-between border border-slate-700/50">
                  <span className="text-xs font-bold text-slate-400">Certificación</span>
                  <span className="text-sm font-black text-emerald-400 underline underline-offset-4 decoration-emerald-400/30">Incluida</span>
                </div>
                {course.courseStart && (
                  <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Periodo Lectivo</div>
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold text-white">{new Date(course.courseStart).toLocaleDateString('es-ES')}</div>
                      <div className="w-4 h-[1px] bg-slate-700"></div>
                      <div className="text-[10px] font-bold text-white">{course.courseEnd ? new Date(course.courseEnd).toLocaleDateString('es-ES') : 'TBD'}</div>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setShowEnroll(true)}
                className="w-full bg-white text-slate-900 py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all transform active:scale-95 shadow-xl"
              >
                Solicitar esta Beca
              </button>

              <p className="mt-6 text-[10px] text-slate-500 font-medium text-center leading-relaxed">
                Al solicitar esta beca, inicias el proceso de pre-inscripción y reserva de plaza.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {showEnroll && (
        <EnrollModal 
          course={course}
          onClose={() => setShowEnroll(false)}
        />
      )}
    </div>
  );
}
