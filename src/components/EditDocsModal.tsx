import React from 'react';
import { motion } from 'motion/react';
import { X, Check } from 'lucide-react';
import { SCORING_CRITERIA, formatFechaLarga } from '../lib/data';
import { cn } from '../lib/utils';
import DateSlotPicker from './DateSlotPicker';

export default function EditDocsModal({ registration, course, onClose, onSuccess }: any) {
  const [formData, setFormData] = React.useState({
    criterias: registration.criterias || [],
    files: registration.files || [],
    franja: registration.franja || '',
    franjaLabel: registration.franjaLabel || ''
  });
  const [points, setPoints] = React.useState(registration.points || 0);
  const [loading, setLoading] = React.useState(false);

  // Recalculate points on load just in case
  React.useEffect(() => {
    let pts = 0;
    formData.criterias.forEach((cid: string) => {
      const c = SCORING_CRITERIA.find(x => x.id === cid);
      if (c) pts += c.pts;
    });
    setPoints(pts);
  }, []);

  const handleFileUpload = (criteriaId: string, fileName: string) => {
    setFormData(prev => ({
      ...prev,
      files: [...prev.files.filter((f: any) => f.criteria !== criteriaId), { criteria: criteriaId, name: fileName }]
    }));
  };

  const handleCriteriaChange = (id: string, pts: number) => {
    const isSelected = formData.criterias.includes(id);
    const newCriterias = isSelected 
      ? formData.criterias.filter((c: string) => c !== id)
      : [...formData.criterias, id];
    
    const newFiles = isSelected 
      ? formData.files.filter((f: any) => f.criteria !== id)
      : formData.files;

    setFormData({ ...formData, criterias: newCriterias, files: newFiles });
    setPoints((prev: number) => isSelected ? prev - pts : prev + pts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/students/${registration.code}/docs`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criterias: formData.criterias, files: formData.files, points, franja: formData.franja, franjaLabel: formData.franjaLabel })
      });
      if (res.ok) {
        onSuccess(await res.json());
      } else {
        alert("Error al actualizar la documentación.");
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Only allow updating if enrollEnd has not passed
  const isEnded = course?.enrollEnd && new Date(course.enrollEnd).getTime() < new Date().getTime();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900">Editar Documentación</h2>
            <p className="text-sm text-slate-500">{course?.title} (Exp: {registration.trackingCode})</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-600" /></button>
        </div>

        {isEnded ? (
           <div className="p-8 text-center text-slate-500">
             El periodo de preinscripción para este curso ya ha finalizado. No es posible modificar la documentación.
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
            <div className="space-y-4">
               {SCORING_CRITERIA.map(c => (
                  <div key={c.id} className="flex flex-col">
                    <label 
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border text-sm cursor-pointer transition-all",
                        formData.criterias.includes(c.id) 
                          ? "bg-primary/5 border-primary text-primary" 
                          : "bg-white border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={formData.criterias.includes(c.id)}
                        onChange={() => handleCriteriaChange(c.id, c.pts)}
                      />
                      <span className="text-lg">{c.icon}</span>
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
                          <div className="shrink-0 text-right">
                            {formData.files.some((f: any) => f.criteria === c.id) ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md font-bold truncate max-w-[120px]">
                                  {formData.files.find((f: any) => f.criteria === c.id)?.name}
                                </span>
                                <label className="text-[10px] uppercase font-bold text-slate-400 hover:text-slate-600 cursor-pointer underline">
                                  Cambiar
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleFileUpload(c.id, file.name);
                                    }} 
                                  />
                                </label>
                              </div>
                            ) : (
                              <label className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-primary/90 transition-colors shadow-sm inline-block">
                                Subir Archivo
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(c.id, file.name);
                                  }} 
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
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
                dates={course?.diasDisponibles || []}
                value={formData.franja}
                onChange={(iso) => setFormData(prev => ({
                  ...prev,
                  franja: iso,
                  franjaLabel: formatFechaLarga(iso)
                }))}
              />
              <p className="text-[10px] text-slate-400 font-medium ml-1 leading-relaxed">
                {formData.franja
                  ? `Tu día elegido: ${formatFechaLarga(formData.franja)}.`
                  : 'Puedes cambiar el día concreto mientras tu solicitud siga pendiente de validación.'}
              </p>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center font-black">
                <span className="text-slate-700">Puntos Totales:</span>
                <span className="text-2xl text-primary">{points} pts</span>
              </div>
            </div>

            <button type="submit" disabled={loading || (formData.criterias.length > 0 && formData.files.length !== formData.criterias.length)} className="w-full btn-primary py-4 disabled:opacity-50">
               {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
