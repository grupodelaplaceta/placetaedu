import React from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../lib/auth';
import { Course } from '../components/CourseCard';
import EditDocsModal from '../components/EditDocsModal';
import { motion } from 'motion/react';
import { BookOpen, Calendar, Clock, CheckCircle2, AlertCircle, FileCheck, ShieldCheck, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Perfil() {
  const { user, loading, loginWithEmail, token } = useAuth(); // We might need a reload function, but we can just update local user or let auth context handle it. Actually let's use mutate.
  const [registrations, setRegistrations] = React.useState<any[]>([]);
  const [courses, setCourses] = React.useState<Record<number, Course>>({});
  const [reportingCode, setReportingCode] = React.useState<string | null>(null);
  const [editingReg, setEditingReg] = React.useState<any | null>(null);
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [profileName, setProfileName] = React.useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) setProfileName(user.name || user.nombre || '');
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!profileName.trim()) return;
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: profileName })
      });
      if (res.ok) {
        const data = await res.json();
        // Update local storage
        localStorage.setItem('placetaidUser', encodeURIComponent(JSON.stringify(data.user)));
        // Reload to apply
        window.location.reload();
      }
    } catch(e) {
      console.error("Error updating profile", e);
    }
  };

  const handleReportFinish = async (code: string) => {
    setReportingCode(code);
    try {
      const res = await fetch(`/api/students/${code}/report-finished`, { method: 'POST' });
      if (res.ok) {
        setRegistrations(prev => prev.map(r => r.code === code ? { ...r, userReportedFinished: true } : r));
      }
    } catch(e) {
      console.error(e);
    }
    setReportingCode(null);
  };

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  React.useEffect(() => {
    if (user?.dni || user?.email) {
      // Find all registrations for this user
      fetch('/api/students')
        .then(res => { if(!res.ok) throw new Error('API Error'); return res.json(); })
        .then(data => {
          const myRegs = data.filter((d: any) => 
            (user.dni && d.dni === user.dni) || 
            (user.email && d.email === user.email)
          );
          setRegistrations(myRegs);
        })
        .catch(console.error);
        
      fetch('/api/courses')
        .then(res => { if(!res.ok) throw new Error('API Error'); return res.json(); })
        .then(data => {
          const cMap: Record<number, Course> = {};
          data.forEach((c: Course) => cMap[c.id] = c);
          setCourses(cMap);
        })
        .catch(console.error);
    }
  }, [user]);

  React.useEffect(() => {
    if (registrations.some(r => r.status === 'finalizado' && r.scholarshipOutcome === 'graduado')) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
      
      return () => clearInterval(interval);
    }
  }, [registrations]);

  if (loading || !user) return <div className="p-20 text-center">Cargando...</div>;

  const STATUS_STEPS = [
    { id: 'pendiente', label: 'Pendiente' },
    { id: 'validado', label: 'Validado' },
    { id: 'matricula_pendiente', label: 'Falta Contrato' },
    { id: 'matriculado', label: 'En Curso' },
    { id: 'completado', label: 'Completado' }
  ];

  const getStepIndex = (status: string) => {
    if (status === 'rechazado') return -1;
    return STATUS_STEPS.findIndex(s => s.id === status);
  };

  return (
    <div className="flex-1 bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">Área Personal</h1>
                {!isEditingProfile ? (
                  <p className="text-slate-500 font-medium">{user.nombre || user.name}</p>
                ) : (
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="text" 
                      className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium outline-none focus:border-primary"
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                    />
                    <button onClick={handleUpdateProfile} className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary-dark">Guardar</button>
                    <button onClick={() => { setIsEditingProfile(false); setProfileName(user.name || user.nombre || ''); }} className="text-slate-500 hover:text-slate-700 text-xs font-bold px-2">Cancelar</button>
                  </div>
                )}
              </div>
            </div>
            {!isEditingProfile && (
              <div className="flex gap-2">
                <Link 
                  to={`/usuario/${user.id}`}
                  target="_blank"
                  className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-emerald-600 transition-colors border border-slate-200 hover:border-emerald-200 px-3 py-1.5 rounded-lg whitespace-nowrap bg-emerald-50/50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  <span>Perfil Público</span>
                </Link>
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors border border-slate-200 px-3 py-1.5 rounded-lg whitespace-nowrap"
                >
                  Editar
                </button>
              </div>
            )}
          </div>
        </div>

        <h2 className="text-xl font-black text-slate-900 mb-6">Mis Inscripciones</h2>

        {registrations.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl text-center border border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-2">No tienes inscripciones activas</h3>
            <p className="text-slate-500 mb-6">Explora nuestro catálogo y solicita una beca.</p>
            <Link to="/cursos" className="btn-primary py-3 px-6">Ver Cursos</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {registrations.map(reg => {
              const course = courses[reg.courseId];
              const currentIndex = getStepIndex(reg.status);
              
              return (
                <motion.div key={reg._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        Expediente: {reg.trackingCode}
                      </div>
                      <h3 className="text-xl font-black text-slate-900 leading-tight">
                        {course?.title || `Curso #${reg.courseId}`}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">{course?.institution}</p>
                    </div>
                  </div>

                  {/* Timeline */}
                  {reg.status !== 'rechazado' && (
                    <div className="mt-8 mb-6 relative">
                      <div className="absolute top-4 left-0 w-full h-1 bg-slate-100 rounded-full -z-10"></div>
                      <div className="absolute top-4 left-0 h-1 bg-primary rounded-full -z-10 transition-all duration-1000" style={{ width: `${(Math.max(currentIndex, 0) / (STATUS_STEPS.length - 1)) * 100}%` }}></div>
                      
                      <div className="flex justify-between relative">
                        {STATUS_STEPS.map((step, idx) => {
                          const isPast = idx <= currentIndex;
                          const isCurrent = idx === currentIndex;
                          return (
                            <div key={step.id} className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isPast ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-400 border border-slate-200'
                              } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                                {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                              </div>
                              <div className={`text-[10px] uppercase font-bold mt-2 ${isPast ? 'text-primary' : 'text-slate-400'}`}>
                                {step.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {reg.status === 'pendiente' && (
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                          <div>
                            <div className="font-bold text-amber-800 text-sm">Validación Pendiente</div>
                            <div className="text-xs text-amber-700 mt-1">Puedes modificar tu documentación acreditativa (criterios y puntos) antes de que finalice el periodo de preinscripción.</div>
                          </div>
                        </div>
                        <button onClick={() => setEditingReg(reg)} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap hidden sm:block shadow-sm">
                          Editar Documentación
                        </button>
                      </div>
                    </div>
                  )}

                  {reg.status === 'rechazado' && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium flex items-center gap-3">
                      <AlertCircle className="w-5 h-5" />
                      Lamentablemente, tu solicitud no ha podido ser validada en esta convocatoria.
                    </div>
                  )}

                  {(reg.status === 'validado' || reg.status === 'matricula_pendiente') && (
                    <div className="bg-amber-50 text-amber-700 p-4 rounded-xl text-sm font-medium flex items-start sm:items-center justify-between gap-4 mt-4 border border-amber-100 flex-col sm:flex-row">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                        <div>Tienes el curso en proceso. Te hemos enviado las credenciales de acceso a tu correo.</div>
                      </div>
                      {!reg.userReportedFinished ? (
                        <button 
                          onClick={() => handleReportFinish(reg.code)}
                          disabled={reportingCode === reg.code}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shrink-0 transition-colors uppercase tracking-widest disabled:opacity-50"
                        >
                          {reportingCode === reg.code ? '...' : 'He terminado el curso'}
                        </button>
                      ) : (
                        <div className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg font-bold text-xs shrink-0 border border-amber-200">
                          Revisión solicitada
                        </div>
                      )}
                    </div>
                  )}

                  {reg.status === 'finalizado' && reg.scholarshipOutcome === 'graduado' && (
                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-start gap-4 mt-4 border border-emerald-100">
                      <FileCheck className="w-8 h-8 text-emerald-500 shrink-0" />
                      <div className="flex-1">
                        <div className="font-bold">¡Enhorabuena! Has graduado tu beca formativa.</div>
                        <div className="text-[11px] opacity-80 uppercase tracking-widest mt-0.5 mb-3">
                          {reg.certificateUrl ? 'Certificaciones disponibles' : 'Tu acreditación está en proceso de emisión y se subirá aquí próximamente.'}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {reg.certificateUrl && (
                            <a href={reg.certificateUrl} target="_blank" rel="noopener noreferrer" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                              <Download className="w-4 h-4" />
                              Descargar Diploma Oficial
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {reg.status === 'finalizado' && reg.scholarshipOutcome === 'suspendido' && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium flex items-center gap-3 mt-4 border border-red-100">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                      <div>
                        Beca Suspendida. Has incumplido los requisitos de la formación. Esto reducirá tu prioridad en futuras convocatorias de becas. Para dudas, contacta con soporte.
                      </div>
                    </div>
                  )}

                  {reg.status === 'finalizado' && !reg.certificateUrl && reg.scholarshipOutcome !== 'graduado' && reg.scholarshipOutcome !== 'suspendido' && (
                    <div className="bg-slate-50 text-slate-700 p-4 rounded-xl text-sm font-medium flex items-center gap-3 mt-4 border border-slate-200">
                      <CheckCircle2 className="w-5 h-5 text-slate-500 shrink-0" />
                      <div>Beca Finalizada. El resultado de la misma estará disponible próximamente en este panel o solicitándolo a soporte.</div>
                    </div>
                  )}

                  {reg.status === 'finalizado' && reg.certificateUrl && reg.scholarshipOutcome !== 'graduado' && reg.scholarshipOutcome !== 'suspendido' && (
                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center justify-between mt-4 border border-emerald-100">
                      <div className="flex items-center gap-3">
                        <FileCheck className="w-8 h-8 text-emerald-500 shrink-0" />
                        <div>
                          <div className="font-bold">Beca Finalizada</div>
                          <div className="text-[11px] opacity-80 uppercase tracking-widest mt-0.5">Certificado disponible</div>
                        </div>
                      </div>
                      <a href={reg.certificateUrl} target="_blank" rel="noopener noreferrer" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                        <Download className="w-4 h-4" />
                        Descargar
                      </a>
                    </div>
                  )}

                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {editingReg && (
         <EditDocsModal 
           registration={editingReg} 
           course={courses[editingReg.courseId]} 
           onClose={() => setEditingReg(null)} 
           onSuccess={(updated: any) => {
             setRegistrations(prev => prev.map(r => r.code === updated.code ? updated : r));
             setEditingReg(null);
           }}
         />
      )}
    </div>
  );
}
