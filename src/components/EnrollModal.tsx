
import React from 'react';
import { X, CheckCircle2, ShieldCheck, AlertCircle, UploadCloud, FileCheck, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SCORING_CRITERIA, formatFechaLarga } from '../lib/data';
import { type Course } from './CourseCard';
import { cn } from '../lib/utils';
import DateSlotPicker from './DateSlotPicker';
import { useAuth } from '../lib/auth';
import { generatePreEnrollmentPDF } from '../lib/pdfGenerator';

interface Props {
  course: Course | null;
  onClose: () => void;
}

export default function EnrollModal({ course, onClose }: Props) {
  const [step, setStep] = React.useState<'form' | 'success'>('form');
  const [points, setPoints] = React.useState(0);
  const [trackingCode, setTrackingCode] = React.useState('');
  const { user, login } = useAuth();
  
  const [notifyMsg, setNotifyMsg] = React.useState('');
  const [notifyLoading, setNotifyLoading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: user?.nombre || user?.name || '',
    dni: user?.dni || '',
    email: user?.email || '',
    franja: '',
    franjaLabel: '',
    criterias: [] as string[],
    files: [] as { criteria: string, name: string }[]
  });

  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.nombre || user.name || '',
        dni: prev.dni || user.dni || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  React.useEffect(() => {
    if (course) {
      setStep('form');
    }
  }, [course]);

  if (!course) return null;

  const now = new Date().getTime();
  const START_DATE = course.enrollStart ? new Date(course.enrollStart).getTime() : 0;
  const END_DATE = course.enrollEnd ? new Date(course.enrollEnd).getTime() : Infinity;
  const isUpcoming = now < START_DATE;
  const isEnded = now > END_DATE;
  const isActive = !isUpcoming && !isEnded;

  const handleFileUpload = (criteriaId: string, fileName: string) => {
    setFormData(prev => ({
      ...prev,
      files: [...prev.files.filter(f => f.criteria !== criteriaId), { criteria: criteriaId, name: fileName }]
    }));
  };

  const handleCriteriaChange = (id: string, pts: number) => {
    const isSelected = formData.criterias.includes(id);
    const newCriterias = isSelected 
      ? formData.criterias.filter(c => c !== id)
      : [...formData.criterias, id];
    
    // Remove files if unselecting
    const newFiles = isSelected 
      ? formData.files.filter(f => f.criteria !== id)
      : formData.files;

    setFormData({ ...formData, criterias: newCriterias, files: newFiles });
    setPoints(prev => isSelected ? prev - pts : prev + pts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.franja) {
      alert('Selecciona la franja de días en la que prefieres hacer el curso.');
      return;
    }
    
    try {
      const payload = {
        ...formData,
        courseId: course?.id,
        courseTitle: course?.title,
        callNumber: course?.callNumber,
        scholarshipStart: course?.courseStart,
        scholarshipEnd: course?.courseEnd,
        points,
      };

      const response = await fetch('/api/students/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error('API Error');
      
      const data = await response.json();
      setTrackingCode(data.code);
      setStep('success');
    } catch (err) {
      console.error("Error submitting registration", err);
      alert("Hubo un error al registrar tu expediente. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        layoutId="enroll-modal"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        {!isActive ? (
          <div className="p-10 text-center flex flex-col items-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isUpcoming ? 'bg-amber-100 text-amber-500' : 'bg-slate-100 text-slate-500'}`}>
              <AlertCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              {isUpcoming ? 'La convocatoria aún no está abierta' : 'La convocatoria ha cerrado'}
            </h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm">
              {isUpcoming 
                ? `Regresa el ${course.enrollStart ? new Date(course.enrollStart).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : ''} para enviar tu solicitud.` 
                : 'El plazo de preinscripción ha finalizado. Te esperamos en la siguiente edición. Añade tu email si quieres que te avisemos cuando abra de nuevo.'}
            </p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setNotifyLoading(true);
              const fmData = new FormData(e.currentTarget);
              const email = fmData.get('email');
              try {
                const res = await fetch(`/api/courses/${course.id}/notify`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email })
                });
                if (res.ok) {
                  setNotifyMsg("¡Te hemos añadido a la lista!");
                } else {
                  setNotifyMsg("Hubo un error");
                }
              } catch(e) {
                setNotifyMsg("Hubo un error");
              }
              setNotifyLoading(false);
            }} className="w-full mb-6">
              <div className="flex bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 ring-primary/20">
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Tu correo electrónico..." 
                  required 
                  className="flex-1 bg-transparent px-4 py-3 outline-none text-sm" 
                  defaultValue={formData.email}
                />
                <button type="submit" disabled={notifyLoading} className="bg-primary text-white font-bold text-xs uppercase tracking-widest px-4 hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {notifyLoading ? '...' : 'Avisadme'}
                </button>
              </div>
              {notifyMsg && <p className="text-xs font-bold mt-2 text-primary">{notifyMsg}</p>}
            </form>

            <button onClick={onClose} className="btn-secondary w-full py-4 uppercase tracking-widest text-sm">
              Cerrar
            </button>
          </div>
        ) : !user ? (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Inicia Sesión</h3>
            <p className="text-sm text-slate-500 mb-8 max-w-sm">
              Para dar de alta tu expediente y solicitar una beca, necesitas iniciar sesión o crear una cuenta.
            </p>
            <button onClick={login} className="btn-primary w-full py-4 uppercase tracking-widest text-sm">
              Iniciar Sesión
            </button>
            <button onClick={onClose} className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600">
              Cancelar
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {step === 'form' ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 pt-10"
              >
                <div className="mb-6">
                  <span className="text-primary font-black text-[10px] tracking-widest uppercase mb-1 block">Solicitud de Beca</span>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">
                    {course.title}
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nombre Completo</label>
                      <input 
                        required
                        type="text" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="Ej: Sofía García Lopez"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">DNI / NIE</label>
                        <input 
                          required
                          type="text" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-all"
                          placeholder="12345678X"
                          value={formData.dni}
                          onChange={e => setFormData({...formData, dni: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
                        <input 
                          required
                          type="email" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-all"
                          placeholder="tu@correo.com"
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Criterios Sociales</label>
                    <div className="grid grid-cols-1 gap-2">
                      {SCORING_CRITERIA.map(c => (
                        <div key={c.id} className="flex flex-col">
                          <label 
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-xl border text-sm cursor-pointer transition-all",
                              formData.criterias.includes(c.id) 
                                ? "bg-primary/5 border-primary text-primary" 
                                : "bg-white border-slate-100 hover:border-slate-200"
                            )}
                          >
                            <input 
                              type="checkbox" 
                              className="hidden" 
                              checked={formData.criterias.includes(c.id)}
                              onChange={() => handleCriteriaChange(c.id, c.pts)}
                            />
                            <span className="text-base">{c.icon}</span>
                            <div className="flex-1 font-medium">{c.label}</div>
                            <span className="font-bold">+{c.pts}</span>
                          </label>
                          {formData.criterias.includes(c.id) && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              className="bg-primary/5 px-4 py-3 rounded-b-xl -mt-2 border-x border-b border-primary/20"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                  <span className="text-[10px] font-bold text-primary uppercase block mb-1">Doc. necesaria:</span>
                                  <p className="text-[11px] text-slate-600 leading-tight italic">
                                    {c.docs}
                                  </p>
                                </div>
                                <label className="shrink-0 cursor-pointer group/upload">
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleFileUpload(c.id, file.name);
                                    }}
                                  />
                                  {formData.files.some(f => f.criteria === c.id) ? (
                                    <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-[10px] font-bold">
                                      <FileCheck className="w-3.5 h-3.5" />
                                      Subido
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-primary-dark transition-colors shadow-sm">
                                      <UploadCloud className="w-3.5 h-3.5" />
                                      Subir
                                    </div>
                                  )}
                                </label>
                              </div>
                              {formData.files.some(f => f.criteria === c.id) && (
                                <div className="mt-2 text-[10px] text-emerald-600 font-medium truncate italic">
                                  Archivo: {formData.files.find(f => f.criteria === c.id)?.name}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Día específico</label>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        formData.franja ? "text-emerald-500" : "text-slate-400"
                      )}>
                        {formData.franja ? 'Seleccionado ✓' : 'Obligatorio'}
                      </span>
                    </div>
                    <DateSlotPicker
                      dates={course.diasDisponibles || []}
                      value={formData.franja}
                      onChange={(iso) => setFormData(prev => ({
                        ...prev,
                        franja: iso,
                        franjaLabel: formatFechaLarga(iso)
                      }))}
                    />
                    <p className="text-[10px] text-slate-400 font-medium ml-1 leading-relaxed">
                      {formData.franja
                        ? `Tu día elegido: ${formatFechaLarga(formData.franja)}. Podremos confirmarlo según disponibilidad.`
                        : 'Elige el día concreto en el que prefieres hacer el curso.'}
                    </p>
                  </div>

                  <div className="bg-primary/10 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-black text-primary text-lg">
                        {points}
                      </div>
                      <div className="text-xs font-bold text-primary leading-tight uppercase">
                        Puntos<br/>Estimados
                      </div>
                    </div>
                    <div className="text-[10px] text-primary/60 font-medium max-w-[120px] text-right">
                      Tu posición final depende de la validación de documentos
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="flex gap-3 cursor-pointer group">
                      <input type="checkbox" required className="w-5 h-5 mt-0.5 accent-primary" />
                      <span className="text-[11px] text-slate-500 leading-relaxed group-hover:text-slate-700">
                        Declaro que la información es veraz y me comprometo a enviar la documentación en 10 días. Entiendo que la plaza no está asegurada hasta validación.
                      </span>
                    </label>
                    <button type="submit" className="btn-primary py-4 text-base shadow-xl shadow-primary/30">
                      Enviar Solicitud
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-10 text-center flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-secondary" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">¡Solicitud Registrada!</h3>
                <p className="text-sm text-slate-500 mb-6 max-w-sm">
                  Hemos recibido tu solicitud para el curso <strong>{course.title}</strong>. 
                  Guarda este código para consultar el estado.
                </p>

                {formData.franjaLabel && (
                  <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3 w-full mb-6">
                    <span className="text-2xl">📅</span>
                    <div className="text-left">
                      <div className="text-[9px] font-black text-primary uppercase tracking-widest">Tu día elegido</div>
                      <div className="text-xs font-bold text-slate-700 leading-snug">{formData.franjaLabel}</div>
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 border-2 border-dashed border-primary/20 rounded-2xl p-6 mb-8 w-full group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Copy logic could go here */}
                  </div>
                  <div className="text-3xl font-black text-primary tracking-widest">
                    {trackingCode}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                    Código de Seguimiento
                  </div>
                </div>

                <div className="text-center mb-6">
                  <a 
                    href="/seguimiento" 
                    className="text-xs font-black text-primary hover:underline uppercase tracking-widest"
                  >
                    Ir al Portal de Seguimiento →
                  </a>
                </div>

                <div className="space-y-4 w-full">
                  <button 
                    onClick={() => generatePreEnrollmentPDF({
                      code: trackingCode,
                      name: formData.name,
                      email: formData.email,
                      dni: formData.dni,
                      points: points,
                      courseTitle: course.title,
                      status: 'pendiente'
                    })}
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                  >
                    <Download className="w-4 h-4" /> Descargar Pre-Inscripción PDF
                  </button>
                  <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-xl text-left">
                    <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-blue-700 leading-relaxed">
                      {formData.files.length > 0 
                        ? "Hemos recibido tus documentos correctamente. Serán validados en las próximas 48h y eliminados tras la verificación."
                        : "No has subido documentos. Recuerda que la plaza o los puntos no se considerarán definitivos hasta revisar la acreditación que deberás adjuntar en el formulario."
                      }
                    </p>
                  </div>
                  <button onClick={onClose} className="btn-primary w-full py-4 uppercase tracking-widest text-sm">
                    Entendido
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
