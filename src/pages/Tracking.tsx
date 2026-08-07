
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2, BookOpen, User, Calendar, MapPin, CheckCircle, Clock, Download, FileText, ShieldCheck, Info, Award, Globe, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { getScheduleSlot } from '../lib/data';
import { generatePreEnrollmentPDF, generateEnrollmentPDF } from '../lib/pdfGenerator';

export default function Tracking() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab ] = React.useState<'private' | 'public'>('private');
  const [code, setCode] = React.useState(searchParams.get('code') || '');
  const [result, setResult] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [publicList, setPublicList] = React.useState<any[]>([]);
  const [loadingPublic, setLoadingPublic] = React.useState(false);

  const performSearch = async (searchCode: string) => {
    if (!searchCode) return;
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/students/${searchCode.toUpperCase()}`);
      if (!response.ok) throw new Error('No encontrado');
      const data = await response.json();
      setResult(data);
    } catch(err) {
      setError('Expediente no encontrado. Verifica tu código oficial (Ej: PLC-****-2025).');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicList = async () => {
    setLoadingPublic(true);
    try {
      const res = await fetch('/api/students/public/list');
      if (res.ok) {
        const data = await res.json();
        setPublicList(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPublic(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'public') {
      fetchPublicList();
    }
  }, [activeTab]);

  React.useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      performSearch(codeParam);
    }
  }, [searchParams]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(code);
  };

  const statusSteps = [
    { id: 'pendiente', label: 'Solicitud Recibida', icon: Clock },
    { id: 'matricula_pendiente', label: 'Formación en Curso', icon: BookOpen },
    { id: 'validado', label: 'Matrícula Completada', icon: Award },
    { id: 'finalizado', label: 'Beca Finalizada', icon: CheckCircle },
  ];

  const getCurrentStepIndex = (status: string) => {
    if (status === 'pendiente') return 0;
    if (status === 'matricula_pendiente') return 1;
    if (status === 'validado') return 2;
    if (status === 'finalizado') return 3;
    return 0;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-[70vh]">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Gestión de Expedientes</h1>
        <p className="text-slate-500 font-medium max-w-xl mx-auto">
          Consulta el estado de tu beca de formación o revisa el listado oficial de solicitudes admitidas.
        </p>
      </div>

      <div className="flex p-1 bg-slate-100 rounded-2xl mb-10 max-w-md mx-auto">
        <button 
          onClick={() => setActiveTab('private')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            activeTab === 'private' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <Lock className="w-4 h-4" /> Mi Expediente
        </button>
        <button 
          onClick={() => setActiveTab('public')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            activeTab === 'public' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <Globe className="w-4 h-4" /> Listado Oficial
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'private' ? (
          <motion.div 
            key="private"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            <div className="bg-white border border-slate-200 shadow-sm p-1 items-center gap-1 rounded-2xl flex focus-within:ring-2 focus-within:ring-primary/20 transition-all max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="flex flex-1">
                <input 
                  type="text" 
                  placeholder="Introduce tu código oficial"
                  className="flex-1 bg-transparent border-none outline-none px-4 py-4 font-bold text-slate-700 tracking-wider uppercase placeholder:normal-case placeholder:font-medium placeholder:text-slate-400 placeholder:tracking-normal text-sm"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={loading || !code}
                  className="bg-primary text-white hover:bg-primary-dark transition-colors py-3 px-8 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 m-1 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Buscar Expediente
                </button>
              </form>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm font-bold border border-red-100 max-w-2xl mx-auto">
                {error}
              </div>
            )}

            {result && (
              <div className="space-y-8">
                {/* Visual Progress Header */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(getCurrentStepIndex(result.status) + 1) * 25}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {statusSteps.map((step, index) => {
                      const isActive = index <= getCurrentStepIndex(result.status);
                      const isCurrent = index === getCurrentStepIndex(result.status);
                      const StepIcon = step.icon;
                      return (
                        <div key={step.id} className="flex flex-col items-center text-center gap-3">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500",
                            isCurrent ? "bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/20" : 
                            isActive ? "bg-emerald-50 border-emerald-200 text-emerald-600" : 
                            "bg-slate-50 border-slate-100 text-slate-300"
                          )}>
                            <StepIcon className="w-6 h-6" />
                          </div>
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest leading-tight",
                            isActive ? "text-slate-900" : "text-slate-300"
                          )}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div>
                      <div className="text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1">
                        Programa Solicitado {result.callNumber && `• Convocatoria ${result.callNumber}`}
                      </div>
                      <h3 className="text-xl font-black text-slate-900">{result.courseTitle}</h3>
                      {result.franjaLabel && (
                        <div className="mt-2.5 inline-flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-3 py-1.5">
                          <span className="text-sm">{getScheduleSlot(result.franja)?.emoji || '🕒'}</span>
                          <span className="text-[10px] font-black text-primary uppercase tracking-wider">Franja: {result.franjaLabel}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => generatePreEnrollmentPDF(result)}
                        className="bg-white border border-slate-200 text-slate-700 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF Pre-Inscripción
                      </button>
                      {(result.status === 'validado' || result.status === 'matricula_pendiente') && (
                        <button 
                          onClick={() => generateEnrollmentPDF(result)}
                          className="bg-emerald-600 text-white h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
                        >
                          <FileText className="w-3.5 h-3.5" /> PDF Matrícula
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Solicitante</div>
                          <div className="text-slate-900 font-black">{result.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <div className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Fecha Registro</div>
                          <div className="text-slate-900 font-bold">{new Date(result.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100">
                      <div className="flex items-start gap-4">
                        <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                          {result.status === 'validado' || result.status === 'matricula_pendiente' 
                            ? 'Felicidades. Tu beca está activa. Puedes descargar tu certificado de admisión y comenzar tu formación siguiendo las instrucciones enviadas a tu email.'
                            : 'Estamos analizando tu documentación. Este proceso suele tardar de 3 a 5 días laborables Dependiendo del volumen de solicitudes y puntos obtenidos.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-8">
                    <div className="bg-primary rounded-[2rem] p-8 text-white flex items-center justify-between shadow-xl shadow-primary/20">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-white/60">Puntos Baremo</div>
                        <div className="text-5xl font-black">{result.points}</div>
                      </div>
                      <Award className="w-16 h-16 text-white/20" />
                    </div>

                    {(result.assignedAccount || result.temporaryPassword) && (
                      <div className="bg-slate-900 rounded-[2rem] p-8 text-white space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                          <Lock className="w-4 h-4" /> Credenciales Acceso
                        </h4>
                        <div className="space-y-4">
                          {result.assignedAccount && (
                            <div>
                              <div className="text-[8px] font-black text-slate-500 uppercase mb-1">Email / Usuario</div>
                              <div className="text-sm font-mono font-bold text-white bg-slate-800 p-3 rounded-xl border border-slate-700 select-all hover:bg-slate-700 transition-colors">
                                {result.assignedAccount}
                              </div>
                            </div>
                          )}
                          {result.temporaryPassword && (
                            <div>
                              <div className="text-[8px] font-black text-slate-500 uppercase mb-1">Contraseña Temporal</div>
                              <div className="text-sm font-mono font-bold text-white bg-slate-800 p-3 rounded-xl border border-slate-700 select-all hover:bg-slate-700 transition-colors">
                                {result.temporaryPassword}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {result.courseDetails && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="md:col-span-2 space-y-6"
                  >
                    <div className="bg-white rounded-[2.5rem] p-4 border border-slate-200 shadow-sm overflow-hidden">
                      <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full translate-x-12 -translate-y-12"></div>
                         
                         <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                                <BookOpen className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Expediente Académico</div>
                                <h3 className="text-xl font-black">{result.courseTitle}</h3>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              <div className="lg:col-span-2 space-y-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                  <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Resumen de Competencias</div>
                                  <div className="flex flex-wrap gap-2">
                                    {(result.courseDetails.learningPoints || ['Certificación Oficial', 'Software Profesional', 'Tutoría 24/7']).map((point: string, i: number) => (
                                      <span key={i} className="text-[10px] font-bold bg-white/10 text-white/80 px-3 py-1.5 rounded-lg border border-white/5">
                                        {point}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="p-4">
                                   <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Descripción Oficial</div>
                                   <p className="text-xs text-white/60 leading-relaxed font-medium">
                                     {result.courseDetails.fullDesc || result.courseDetails.desc}
                                   </p>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="bg-white/10 p-5 rounded-3xl border border-white/10">
                                   <div className="flex items-center gap-3 mb-4">
                                      <Award className="w-6 h-6 text-primary" />
                                      <div>
                                        <div className="text-[9px] font-black text-white/40 uppercase tracking-widest">Acreditación</div>
                                        <div className="text-sm font-black">{result.courseDetails.duration}</div>
                                      </div>
                                   </div>
                                   <div className="text-[10px] font-bold text-white/40 mb-1">Entidad Certificadora:</div>
                                   <div className="text-xs font-black text-white">{result.courseDetails.provider || result.courseDetails.institution}</div>
                                </div>

                                {result.courseDetails.syllabusUrl && (
                                  <a 
                                    href={result.courseDetails.syllabusUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full h-12 flex items-center justify-center gap-2 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                                  >
                                    <FileText className="w-4 h-4" /> Bajar Guía Didáctica (PDF)
                                  </a>
                                )}
                              </div>
                            </div>
                         </div>
                      </div>
                    </div>

                    {(result.status === 'validado' || result.status === 'matricula_pendiente') && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-8">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                             <ShieldCheck className="w-6 h-6 text-emerald-600" />
                           </div>
                           <div>
                             <h4 className="text-sm font-black text-emerald-900">Pasos para comenzar tu formación</h4>
                             <p className="text-xs text-emerald-700 font-medium tracking-tight">Lee atentamente las instrucciones de acceso</p>
                           </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-xl border border-emerald-200/50">
                            <div className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-2">1. Plataforma Oficial</div>
                            <p className="text-[11px] text-emerald-700 font-medium">Usa el enlace oficial de la entidad certificadora ({result.courseDetails.provider || result.courseDetails.institution}) para loguearte con la cuenta asignada.</p>
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-emerald-200/50">
                            <div className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-2">2. Cambio de Password</div>
                            <p className="text-[11px] text-emerald-700 font-medium">Se recomienda cambiar la contraseña temporal una vez accedas por primera vez para garantizar tu seguridad.</p>
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-emerald-200/50">
                            <div className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-2">3. Plazos de Entrega</div>
                            <p className="text-[11px] text-emerald-700 font-medium">Debes completar los exámenes y tutorías antes de {result.scholarshipEnd || 'la fecha de fin'} para obtener el diploma oficial.</p>
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-emerald-200/50">
                            <div className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-2">4. Soporte Técnico</div>
                            <p className="text-[11px] text-emerald-700 font-medium">Si tienes problemas de acceso, contacta con edu@laplaceta.org indicando tu código: {result.code}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="public"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-start gap-4 mb-8">
          <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
                <h4 className="text-sm font-black text-amber-900 mb-1">Listado Oficial de Admisiones</h4>
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  Relación de estudiantes que han superado el proceso de baremación. Por seguridad y protección de datos (RGPD), la información se muestra parcialmente anonimizada.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2rem] p-4 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Código</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Solicitante</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Programa</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Pts</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loadingPublic ? (
                      Array(5).fill(0).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={5} className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                        </tr>
                      ))
                    ) : publicList.length > 0 ? (
                      publicList.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-[10px] font-mono font-bold text-slate-500">{item.code}</td>
                          <td className="px-6 py-4 text-xs font-black text-slate-900">{item.name}</td>
                          <td className="px-6 py-4 text-xs font-medium text-slate-500">{item.course}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full">
                              {item.points}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <div className={cn(
                               "flex items-center justify-end gap-1.5 text-[9px] font-black uppercase tracking-widest",
                               item.status === 'finalizado' ? "text-slate-400" : "text-emerald-600"
                             )}>
                               {item.status === 'finalizado' ? (
                                 <>
                                   <Award className="w-3 h-3" /> Finalizada
                                 </>
                               ) : (
                                 <>
                                   <CheckCircle className="w-3 h-3" /> Concedida
                                 </>
                               )}
                             </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium italic text-sm">
                          No hay solicitudes validadas todavía en el sistema.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

