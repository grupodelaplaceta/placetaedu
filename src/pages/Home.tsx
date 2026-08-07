
import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Star, ShieldCheck, HeartPulse, GraduationCap, Users, ExternalLink, BookOpen, Mail, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import CourseCard, { type Course } from '../components/CourseCard';
import EnrollModal from '../components/EnrollModal';
import CountdownTimer from '../components/CountdownTimer';

export default function Home() {
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null);
  const [courses, setCourses] = React.useState<Course[]>([]);

  React.useEffect(() => {
    fetch('/api/courses')
      .then(r => { if (!r.ok) throw new Error('API error'); return r.json(); })
      .then(data => setCourses(data.filter((c: any) => !c.isHidden)))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="flex flex-col bg-white">
      {/* Hero Section */}
      <section className="relative pt-10 pb-20 px-4 overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-white"></div>
        <div className="max-w-4xl mx-auto text-center">
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight mb-6"
          >
            Amplía Tus <span className="text-primary block mt-1">Conocimientos</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          >
            Accede a certificaciones oficiales de Cisco y otras entidades líderes. Asignación de plazas basada en puntuación de méritos y requisitos académicos.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link to="/cursos" className="bg-primary text-white hover:bg-primary-dark transition-colors py-3 px-8 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25">
              Ver Catálogo de Cursos <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/seguimiento" className="bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-colors py-3 px-8 rounded-xl text-sm font-bold shadow-sm">
              Mi Expediente Digital
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Convocatoria Abierta</div>
              <h2 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">Catálogo de Itinerarios</h2>
              <p className="text-base text-slate-500 font-medium">Programas oficiales con beca de acceso gratuito.</p>
            </div>
            <Link to="/cursos" className="bg-white px-6 py-3 border border-slate-200 rounded-xl text-slate-900 font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 text-xs uppercase tracking-wider shadow-sm">
              Ver todos los cursos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.slice(0, 3).map((course, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                key={course.id}
              >
                <CourseCard 
                  course={course} 
                  onEnroll={() => setSelectedCourse(course)} 
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/bases" className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 hover:bg-slate-100 transition-all flex flex-col justify-between group">
                <div>
                   <BookOpen className="w-10 h-10 text-primary mb-6" />
                   <h3 className="text-xl font-black text-slate-900 mb-2">Bases y Requisitos</h3>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed">Consulta la normativa oficial y los criterios de baremación de puntos.</p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary group-hover:gap-4 transition-all">
                   Consultar Bases <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
              <Link to="/seguimiento" className="bg-primary p-10 rounded-[2.5rem] border border-primary/20 hover:brightness-110 transition-all flex flex-col justify-between group text-white">
                <div>
                   <ShieldCheck className="w-10 h-10 text-white/40 mb-6" />
                   <h3 className="text-xl font-black mb-2">Expediente Digital</h3>
                   <p className="text-sm text-white/60 font-medium leading-relaxed">Accede a tu estado de solicitud y descarga tus certificados oficiales.</p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                   Mi Seguimiento <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
           </div>
        </div>
      </section>

      <EnrollModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />
    </div>
  );
}
