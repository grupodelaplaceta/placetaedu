import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, CheckCircle2, Trophy, ArrowRight, ShieldCheck, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

export default function PublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/auth/public/${id}`);
        if (!res.ok) throw new Error('Usuario no encontrado');
        const data = await res.json();
        setProfile(data);
        
        // Show confetti if ANY registration is finished
        if (data.registrations?.some((r: any) => r.status === 'finalizado')) {
          const duration = 3 * 1000;
          const animationEnd = Date.now() + duration;
          const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

          const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

          const interval: any = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) {
              return clearInterval(interval);
            }
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
          }, 250);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-sm">Cargando...</div>;
  if (error || !profile) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
        <ShieldCheck className="w-10 h-10" />
      </div>
      <h1 className="text-2xl font-black text-slate-900 mb-2">Perfil no válido</h1>
      <p className="text-slate-500 mb-8">{error}</p>
      <Link to="/" className="btn-primary">Volver al inicio</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 lg:py-20 relative">
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -translate-y-32 translate-x-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full translate-y-32 -translate-x-32 pointer-events-none"></div>

        <div className="relative p-8 lg:p-14 text-center border-b border-slate-100">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-8 border border-slate-200/50">
            <ShieldCheck className="w-4 h-4 mr-2 text-emerald-500" /> Perfil Verificado
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            {profile.name}
          </h1>
          <p className="text-slate-500 font-medium max-w-lg mx-auto">
             Estudiante de la plataforma Placeta EDU, adscrito a la convocatoria de becas de formación tecnológica.
          </p>
        </div>

        <div className="p-8 lg:p-14 bg-slate-50 relative z-10">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 text-center">Inscripciones y Logros</h2>
          
          <div className="space-y-6">
            {!profile.registrations || profile.registrations.length === 0 ? (
              <div className="text-center text-slate-500 py-10">Este usuario aún no tiene inscripciones públicas.</div>
            ) : (
              profile.registrations
                .filter((reg: any) => reg.status !== 'rechazado')
                .map((reg: any) => (
                <div key={reg.code} className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden group">
                  {reg.status === 'finalizado' && (
                    <div className="absolute -right-12 top-6 bg-emerald-500 text-white text-[10px] uppercase font-black tracking-widest py-1.5 w-40 text-center rotate-45 shadow-lg">
                      Completado
                    </div>
                  )}
                  
                  <div className="shrink-0 relative group/badge">
                     {reg.courseDetails?.badgeUrl ? (
                       <img src={reg.courseDetails.badgeUrl} alt="Insignia del curso" className="w-32 h-32 md:w-32 md:h-32 object-contain drop-shadow-xl" />
                     ) : (
                       <div className="w-32 h-32 bg-slate-100 rounded-full flex flex-col items-center justify-center border-4 border-white shadow-xl text-4xl">
                         {reg.courseDetails?.emoji || '🎓'}
                       </div>
                     )}
                     <div className="absolute -bottom-2 lg:-bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/badge:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-3 rounded-lg whitespace-nowrap pointer-events-none after:content-[''] after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-[5px] after:border-transparent after:border-b-slate-900">
                        Ref: {reg.code}
                     </div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        reg.status === 'finalizado' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        reg.status === 'validado' || reg.status === 'matricula_pendiente' ? "bg-amber-50 text-amber-600 border-amber-100" :
                        "bg-slate-100 text-slate-500 border-slate-200"
                      )}>
                        {reg.status === 'finalizado' ? 'Curso Finalizado' : 'En Progreso'}
                      </span>
                      {reg.courseDetails?.provider && (
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-black uppercase tracking-widest">
                          {reg.courseDetails.provider}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2 leading-tight">
                      {reg.courseTitle}
                    </h3>

                    <div className="flex flex-col gap-1 text-sm font-medium text-slate-500 mb-6">
                      <div>Concedida el {new Date(reg.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      <div className="font-mono text-xs opacity-70">CÓDIGO BECA: {reg.code}</div>
                    </div>

                    {reg.status === 'finalizado' && reg.certificateUrl && (
                      <a href={reg.certificateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 group/btn">
                        <FileText className="w-4 h-4" />
                        Ver Certificado Oficial
                        <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
