
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Search, 
  Filter, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Clock,
  Trash2,
  FileSearch,
  Mail,
  MinusCircle,
  AlertTriangle,
  BookOpen,
  Layers,
  CalendarCheck,
  CalendarRange,
  EyeOff,
  Lock,
  Download,
  FileText,
  Copy,
  Check,
  Bookmark,
  Award,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SCORING_CRITERIA, formatFechaLarga } from '../lib/data';
import { type Course } from '../components/CourseCard';
import { useAuth } from '../lib/auth';
import DateSlotPicker from '../components/DateSlotPicker';
import { generatePreEnrollmentPDF, generateEnrollmentPDF, getEnrollmentEmailTemplate, getCompletionEmailTemplate, generateCourseGroupReportPDF } from '../lib/pdfGenerator';

export default function Admin() {
  const { user, login } = useAuth();
  const [registrations, setRegistrations] = React.useState<any[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [selectedReg, setSelectedReg] = React.useState<any>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filter, setFilter] = React.useState<'todos' | 'pendiente' | 'matricula_pendiente' | 'finalizado' | 'espera_estudiante'>('todos');
  const [selectedCourseId, setSelectedCourseId] = React.useState<number | 'todos'>('todos');
  const [adminTab, setAdminTab ] = React.useState<'solicitudes' | 'cursos'>('solicitudes');
  const [sortBy, setSortBy] = React.useState<'puntos' | 'fecha'>('fecha');
  const [notifyModalCourse, setNotifyModalCourse] = React.useState<Course | null>(null);
  const [subscribers, setSubscribers] = React.useState<any[]>([]);
  
  const handleViewSubscribers = async (course: Course) => {
    try {
      const res = await fetch(`/api/courses/${course.id}/notifications`);
      if (res.ok) {
        const subs = await res.json();
        setSubscribers(subs);
        setNotifyModalCourse(course);
      }
    } catch(e) {
      console.error(e);
    }
  };
  const [newCourse, setNewCourse] = React.useState<Partial<Course>>({ 
    title: '', 
    desc: '', 
    duration: '', 
    level: '', 
    institution: 'Cisco Networking Academy', 
    plazas: 20,
    callNumber: 'UNED-2025-01',
    courseStart: '',
    courseEnd: '',
    badgeUrl: '',
    diasDisponibles: [] as string[]
  });
  const [editingCourseId, setEditingCourseId] = React.useState<number | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [copiedCompletion, setCopiedCompletion] = React.useState(false);
  const [franjaDraft, setFranjaDraft] = React.useState('');
  const [franjaSaved, setFranjaSaved] = React.useState(false);

  const isAdmin = user && (
    user.email === 'malegre@laplaceta.org' ||
    user.role === 'admin' ||
    Object.values(user).some(val => 
      String(val).toLowerCase() === 'admin' || 
      String(val) === '54a133b218d989e5a89a7adb0290eda6' ||
      String(val).toUpperCase() === 'ADMIN-001'
    )
  );

  const loadData = async () => {
    if (!isAdmin) return;
    try {
      const [regsRes, coursesRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/courses')
      ]);
      
      if (!regsRes.ok) throw new Error("Failed to fetch students");
      if (!coursesRes.ok) throw new Error("Failed to fetch courses");
      
      const regsData = await regsRes.json();
      const coursesData = await coursesRes.json();
      setRegistrations(regsData);
      setCourses(coursesData);
    } catch (err) {
      console.error("Error loading admin data", err);
    }
  };

  React.useEffect(() => {
    loadData();
  }, [isAdmin]);

  React.useEffect(() => {
    if (selectedReg || adminTab) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedReg, adminTab]);

  React.useEffect(() => {
    setFranjaDraft(selectedReg?.franja || '');
    setFranjaSaved(false);
  }, [selectedReg]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-4">Acceso Restringido</h1>
        <p className="text-slate-500 mb-8">
          Esta área es exclusiva para administradores de Placeta EDU.
        </p>
        <button onClick={login} className="btn-primary w-full py-4 uppercase tracking-widest text-sm">
          Iniciar Sesión
        </button>
      </div>
    );
  }

  // Rest of the admin functionality
  const handleStatusChange = async (code: string, newStatus: string, duration?: number) => {
    try {
      const res = await fetch(`/api/students/${code}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, duration })
      });
      if (res.ok) {
        const updated = await res.json();
        setRegistrations(prev => prev.map(r => r.code === code ? updated : r));
        if (selectedReg?.code === code) setSelectedReg(updated);
      }
    } catch(err) {
      console.error("Error updating status", err);
    }
  };

  const handleCertificateUpdate = async (code: string, url: string) => {
    try {
      const res = await fetch(`/api/students/${code}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateUrl: url })
      });
      if (res.ok) {
        const updated = await res.json();
        setRegistrations(prev => prev.map(r => r.code === code ? updated : r));
        if (selectedReg?.code === code) setSelectedReg(updated);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAssignmentUpdate = async (field: 'assignedAccount' | 'accountProvider' | 'assignedLicense' | 'temporaryPassword' | 'scholarshipStart' | 'scholarshipEnd' | 'callNumber' | 'acquiredSkills' | 'scholarshipOutcome', value: string) => {
    if (!selectedReg) return;
    try {
      const res = await fetch(`/api/students/${selectedReg.code}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      if (res.ok) {
        const updated = await res.json();
        setRegistrations(prev => prev.map(r => r.code === selectedReg.code ? updated : r));
        setSelectedReg(updated);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFranjaUpdate = async () => {
    if (!selectedReg || !franjaDraft) return;
    try {
      const res = await fetch(`/api/students/${selectedReg.code}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ franja: franjaDraft, franjaLabel: formatFechaLarga(franjaDraft) })
      });
      if (res.ok) {
        const updated = await res.json();
        setRegistrations(prev => prev.map(r => r.code === selectedReg.code ? updated : r));
        setSelectedReg(updated);
        setFranjaSaved(true);
        setTimeout(() => setFranjaSaved(false), 2500);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const copyEmailTemplate = () => {
    if (!selectedReg) return;
    const template = getEnrollmentEmailTemplate(selectedReg);
    navigator.clipboard.writeText(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCompletionEmail = () => {
    if (!selectedReg) return;
    const template = getCompletionEmailTemplate(selectedReg);
    navigator.clipboard.writeText(template);
    setCopiedCompletion(true);
    setTimeout(() => setCopiedCompletion(false), 2000);
  };

  const handlePenalty = async (code: string, criteriaId: string) => {
    const criteria = SCORING_CRITERIA.find(c => c.id === criteriaId);
    if (!criteria) return;

    try {
      const res = await fetch(`/api/students/${code}/penalty`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criteriaId, pointsToDeduct: criteria.pts, criteriaLabel: criteria.label })
      });
      if (res.ok) {
        const updated = await res.json();
        setRegistrations(prev => prev.map(r => r.code === code ? updated : r));
        if (selectedReg?.code === code) setSelectedReg(updated);
      }
    } catch(err) {
      console.error("Error applying penalty", err);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = editingCourseId !== null;
      const url = isEditing ? `/api/courses/${editingCourseId}` : '/api/courses';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse)
      });
      if (res.ok) {
        setNewCourse({ title: '', desc: '', duration: '', level: '', institution: 'Cisco Networking Academy', plazas: 20, badgeUrl: '', diasDisponibles: [] });
        setEditingCourseId(null);
        loadData();
      }
    } catch (err) {
      console.error("Error saving course", err);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourseId(course.id);
    setNewCourse({ ...course });
    setAdminTab('cursos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleToggleCourseVisibility = async (id: number) => {
    try {
      const res = await fetch(`/api/courses/${id}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        const updatedCourse = await res.json();
        setCourses(prev => prev.map(c => c.id === id ? updatedCourse : c));
      }
    } catch (err) {
      console.error("Error toggling course visibility", err);
    }
  };

  const filtered = registrations.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || (r.code && r.code.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesFilter = false;
    if (filter === 'todos') matchesFilter = true;
    else if (filter === 'revision_finalizacion') matchesFilter = r.userReportedFinished === true && r.status !== 'finalizado';
    else matchesFilter = r.status === filter;

    const courseMatch = selectedCourseId === 'todos' || courses.find(c => c.id === selectedCourseId)?.title === r.courseTitle;
    return matchesSearch && matchesFilter && courseMatch;
  }).sort((a, b) => {
    if (sortBy === 'puntos') return b.points - a.points;
    return new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime();
  });

  const getCourseQuota = (courseTitle: string) => {
    const course = courses.find(c => c.title === courseTitle);
    const assignedCount = registrations.filter(r => r.courseTitle === courseTitle && (r.status === 'validado' || r.status === 'matricula_pendiente' || r.status === 'finalizado')).length;
    return {
      total: course?.plazas || 0,
      assigned: assignedCount,
      left: Math.max(0, (course?.plazas || 0) - assignedCount)
    };
  };

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pendiente').length,
    validated: registrations.filter(r => ['validado', 'matricula_pendiente', 'finalizado'].includes(r.status)).length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">Panel de Control</h1>
          <p className="text-slate-500 font-medium">Gestión y validación de becas y cursos</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setAdminTab('solicitudes')}
            className={cn("px-6 py-3 rounded-2xl shadow-sm border font-bold transition-all", adminTab === 'solicitudes' ? 'bg-slate-900 text-white border-transparent' : 'bg-white text-slate-600 border-slate-200')}
          >
            Solicitudes
          </button>
          <button 
            onClick={() => setAdminTab('cursos')}
            className={cn("px-6 py-3 rounded-2xl shadow-sm border font-bold transition-all", adminTab === 'cursos' ? 'bg-slate-900 text-white border-transparent' : 'bg-white text-slate-600 border-slate-200')}
          >
            Gestionar Cursos
          </button>
        </div>
      </div>

      {adminTab === 'solicitudes' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 glass-card p-1 rounded-2xl flex items-center gap-2 pr-4 border-slate-100">
                <div className="pl-4"><Search className="w-5 h-5 text-slate-400" /></div>
                <input 
                  type="text" 
                  placeholder="Buscar solicitante..."
                  className="flex-1 bg-transparent border-none outline-none py-3 text-sm font-medium"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex-1 glass-card p-1 rounded-2xl flex items-center pr-4 border-slate-100">
                <div className="pl-4 shrink-0"><BookOpen className="w-5 h-5 text-slate-400" /></div>
                <select 
                  className="flex-1 bg-transparent border-none outline-none py-3 text-sm font-bold text-slate-700 appearance-none cursor-pointer px-2"
                  value={selectedCourseId}
                  onChange={e => setSelectedCourseId(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
                >
                  <option value="todos">Todos los cursos</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar items-center justify-between">
              <div className="flex gap-1">
                {(['todos', 'pendiente', 'matricula_pendiente', 'validado', 'revision_finalizacion', 'finalizado'] as const).map((f) => {
                  const labels: Record<string, string> = {
                     todos: 'Todos',
                     pendiente: 'Nuevas',
                     matricula_pendiente: 'En Curso',
                     validado: 'Validadas',
                     revision_finalizacion: 'Requiere Revisión',
                     finalizado: 'Terminados'
                  };
                  return (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                        filter === f ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {labels[f]}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-1 border-l border-slate-100 pl-2 ml-2">
                 <button 
                  onClick={() => {
                    const courseTitle = selectedCourseId === 'todos' ? 'Todas las Solicitudes' : courses.find(c => c.id === selectedCourseId)?.title || 'Curso';
                    generateCourseGroupReportPDF(courseTitle, filtered);
                  }}
                  className="p-2 rounded-lg text-primary hover:bg-primary/5 transition-colors"
                  title="Descargar Reporte PDF del Grupo"
                 >
                   <FileText className="w-4 h-4" />
                 </button>
                 <button 
                  onClick={() => setSortBy('fecha')}
                  className={cn("p-2 rounded-lg transition-colors", sortBy === 'fecha' ? "bg-slate-900 text-white" : "text-slate-400 hover:bg-slate-50")}
                  title="Ordenar por fecha"
                 >
                   <Clock className="w-4 h-4" />
                 </button>
                 <button 
                  onClick={() => setSortBy('puntos')}
                  className={cn("p-2 rounded-lg transition-colors", sortBy === 'puntos' ? "bg-slate-900 text-white" : "text-slate-400 hover:bg-slate-50")}
                  title="Ordenar por puntos"
                 >
                   <Award className="w-4 h-4" />
                 </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="glass-card rounded-3xl p-20 text-center flex flex-col items-center justify-center">
                <FileSearch className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-400">No hay solicitudes que coincidan</h3>
              </div>
            ) : (
              filtered.map((reg, idx) => (
                <motion.div 
                  layout
                  key={reg.code}
                  onClick={() => setSelectedReg(reg)}
                  className={cn(
                    "glass-card p-4 rounded-2xl cursor-pointer transition-all border flex items-center gap-4 hover:shadow-xl hover:shadow-primary/5",
                    selectedReg?.code === reg.code ? "ring-2 ring-primary border-transparent bg-white shadow-xl shadow-primary/5" : "border-slate-100 bg-white"
                  )}
                >
                  <div className="relative shrink-0">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg",
                      reg.status === 'validado' ? "bg-emerald-100 text-emerald-600" : 
                      idx < 5 ? "bg-amber-100 text-amber-600" : "bg-primary/10 text-primary"
                    )}>
                      {reg.pts || reg.points}
                    </div>
                    <div className="absolute -top-2 -left-2 w-5 h-5 bg-slate-900 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                      {idx + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black text-slate-400 tracking-widest mb-0.5">{reg.code}</div>
                    <div className="text-base font-bold text-slate-900 truncate">{reg.name}</div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>{reg.courseTitle}</span>
                      {reg.franjaLabel && (
                        <>
                          <span className="text-primary flex items-center gap-1 normal-case font-black">
                            <span>📅</span>
                            <span className="truncate max-w-[140px]">{reg.franjaLabel}</span>
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span>{reg.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {reg.userReportedFinished && reg.status !== 'finalizado' && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-200 text-amber-800 animate-pulse">
                        FIN REPORTADO
                      </span>
                    )}
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      reg.status === 'validado' || reg.status === 'matricula_pendiente' ? "bg-emerald-50 text-emerald-600" : 
                      reg.status === 'finalizado' ? "bg-slate-100 text-slate-600" :
                      reg.status === 'espera_estudiante' ? "bg-blue-50 text-blue-600" :
                      "bg-amber-50 text-amber-600"
                    )}>
                      {reg.status.replace('_', ' ')}
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedReg ? (
              <motion.div 
                key={selectedReg.code}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-2xl p-6 sticky top-24 border border-primary/10 shadow-lg max-h-[85vh] overflow-y-auto no-scrollbar"
              >
                <div className="flex justify-between items-start mb-6 pt-2">
                  <div>
                    <div className="text-[10px] font-black text-primary tracking-widest uppercase mb-1">Detalle de Solicitud</div>
                    <h3 className="text-xl font-black text-slate-900">{selectedReg.code}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <a 
                        href={`/seguimiento?code=${selectedReg.code}`} 
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-[9px] font-black text-primary hover:underline uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-lg"
                      >
                        <ExternalLink className="w-3 h-3" /> Ver Perfil Público
                      </a>
                    </div>
                  </div>
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black",
                    selectedReg.status === 'validado' || selectedReg.status === 'matricula_pendiente' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-primary/10 text-primary"
                  )}>
                    <span className="text-xl leading-none">{selectedReg.points}</span>
                    <span className="text-[8px] uppercase tracking-tighter">PTS</span>
                  </div>
                </div>

                {selectedReg.userReportedFinished && selectedReg.status !== 'finalizado' && (
                  <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-sm mb-1 uppercase tracking-widest">El usuario reporta haber terminado</h4>
                      <p className="text-xs font-medium opacity-80">Por favor, verifica su rendimiento y marca su beca como Finalizada si todo es correcto.</p>
                    </div>
                  </div>
                )}

                <div className="space-y-6 mb-10 overflow-hidden">
                  <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl shadow-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -translate-y-8 translate-x-8"></div>
                    <div className="relative z-10 flex flex-col gap-4">
                       <div className="flex items-center justify-between">
                          <div className="text-[9px] font-black text-primary uppercase tracking-widest">Estado y Cupo</div>
                          <div className="text-[10px] font-bold text-white/50">{getCourseQuota(selectedReg.courseTitle).assigned} / {getCourseQuota(selectedReg.courseTitle).total} Plazas</div>
                       </div>
                       <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(getCourseQuota(selectedReg.courseTitle).assigned / getCourseQuota(selectedReg.courseTitle).total) * 100}%` }}
                            className="h-full bg-primary"
                          />
                       </div>
                       <div className="flex items-center gap-2 text-[9px] text-white/40 font-medium italic">
                         <Info className="w-3 h-3" /> Selección por orden de mérito (puntos) y fecha de inscripción.
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nombre</div>
                      <div className="text-sm font-bold text-slate-900 truncate">{selectedReg.name}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Identificación</div>
                      <div className="text-sm font-bold text-slate-900 truncate">{selectedReg.dni}</div>
                    </div>
                  </div>

                  {selectedReg.franjaLabel && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">📅</span>
                      <div className="min-w-0">
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Día elegido</div>
                        <div className="text-xs font-bold text-slate-900 leading-snug capitalize">{selectedReg.franjaLabel}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-inner">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Award className="w-4 h-4" /> Baremo de Puntuación
                      </div>
                      <div className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full">{selectedReg.points} PTS TOTAL</div>
                    </div>
                    <div className="space-y-2">
                       {selectedReg.criterias?.map((cid: string) => {
                         const criteria = SCORING_CRITERIA.find(c => c.id === cid);
                         const isPenalized = selectedReg.penalties?.some((p: string) => p.includes(criteria?.label || ''));
                         return (
                           <div key={cid} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100/50">
                             <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 truncate">
                               <span>{criteria?.icon}</span>
                               <span className={cn("truncate", isPenalized ? "line-through opacity-40 italic" : "")}>{criteria?.label}</span>
                               {isPenalized && <span className="text-[7px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full uppercase">Baja</span>}
                             </div>
                             <span className={cn("shrink-0 ml-2 text-[11px] font-black", isPenalized ? "text-slate-300" : "text-emerald-500")}>+{criteria?.pts}</span>
                           </div>
                         );
                       })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Validado el</div>
                      <div className="text-[10px] font-bold text-slate-600 italic">Automático por baremación</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <CalendarRange className="w-3 h-3" /> Día específico
                      </div>
                      <DateSlotPicker
                        dates={(courses.find(c => c.id === selectedReg?.courseId)?.diasDisponibles) || []}
                        value={franjaDraft}
                        onChange={setFranjaDraft}
                        compact
                      />
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          type="button"
                          onClick={handleFranjaUpdate}
                          disabled={!franjaDraft || franjaDraft === (selectedReg?.franja || '')}
                          className="flex-1 bg-primary text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Guardar Día
                        </button>
                        {franjaSaved && (
                          <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1 shrink-0">
                            <Check className="w-3.5 h-3.5" /> Guardada
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Bookmark className="w-3 h-3" /> Nº Convocatoria
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="ej: 1/2025"
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium"
                          defaultValue={selectedReg.callNumber || ''}
                          onBlur={(e) => handleAssignmentUpdate('callNumber', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Cuenta Asignada (Google/MS)
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="ej: user@laplaceta.org"
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium"
                          defaultValue={selectedReg.assignedAccount || ''}
                          onBlur={(e) => handleAssignmentUpdate('assignedAccount', e.target.value)}
                        />
                        <select
                          className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium"
                          defaultValue={selectedReg.accountProvider || 'Google'}
                          onChange={(e) => handleAssignmentUpdate('accountProvider', e.target.value)}
                        >
                          <option value="Google">Google</option>
                          <option value="Microsoft">Microsoft</option>
                          <option value="Otra">Otra</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Layers className="w-3 h-3" /> Licencia Canva / Otros
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="ej: Canva Pro Team"
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium"
                          defaultValue={selectedReg.assignedLicense || ''}
                          onBlur={(e) => handleAssignmentUpdate('assignedLicense', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Password Temporal
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="ej: Welcome2024!"
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium"
                          defaultValue={selectedReg.temporaryPassword || ''}
                          onBlur={(e) => handleAssignmentUpdate('temporaryPassword', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Inicio Beca</div>
                        <input 
                          type="date"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-medium"
                          defaultValue={selectedReg.scholarshipStart || ''}
                          onBlur={(e) => handleAssignmentUpdate('scholarshipStart', e.target.value)}
                        />
                      </div>
                      <div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fin Beca</div>
                        <input 
                          type="date"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-medium"
                          defaultValue={selectedReg.scholarshipEnd || ''}
                          onBlur={(e) => handleAssignmentUpdate('scholarshipEnd', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => generatePreEnrollmentPDF(selectedReg)}
                        className="flex items-center justify-center gap-2 bg-white border border-slate-200 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <Download className="w-3 h-3" /> Pre-Insc.
                      </button>
                      <button 
                         onClick={() => generateEnrollmentPDF(selectedReg)}
                         className="flex items-center justify-center gap-2 bg-white border border-slate-200 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <FileText className="w-3 h-3" /> Matrícula
                      </button>
                    </div>

                    <button 
                      onClick={copyEmailTemplate}
                      className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copiado al portapapeles' : 'Copiar Email Matrícula'}
                    </button>
                    
                    <button 
                      onClick={copyCompletionEmail}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors mt-2"
                    >
                      {copiedCompletion ? <Check className="w-3 h-3 text-white" /> : <Mail className="w-3 h-3" />}
                      {copiedCompletion ? 'Copiado al portapapeles' : 'Copiar Email Finalización'}
                    </button>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Candidato</div>
                    <div className="text-sm font-bold text-slate-700">{selectedReg.email}</div>
                  </div>

                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                      <span>Documentación Aportada</span>
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                      {selectedReg.criterias && selectedReg.criterias.length > 0 ? (
                        selectedReg.criterias.map((cid: string) => {
                          const criteria = SCORING_CRITERIA.find(c => c.id === cid);
                          const hasFile = selectedReg.files?.some((f: any) => f.criteria === cid);
                          return (
                            <div key={cid} className="p-3 bg-white border border-slate-100 rounded-xl group hover:border-primary/20 transition-all">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 font-bold text-xs text-slate-700">
                                  <span>{criteria?.icon}</span>
                                  <span>{criteria?.label}</span>
                                </div>
                                <span className="text-[10px] font-black text-primary">+{criteria?.pts} PTS</span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                {hasFile ? (
                                  <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                                    <ExternalLink className="w-3 h-3" />
                                    Ver Documento
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-slate-400 italic font-medium px-2 py-1">Sin archivo adjunto</div>
                                )}
                                <button 
                                  onClick={() => handlePenalty(selectedReg.code, cid)}
                                  className="text-[9px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 flex items-center gap-1 transition-colors"
                                >
                                  <MinusCircle className="w-3 h-3" />
                                  Retirar puntos
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 border-2 border-dashed border-slate-100 rounded-2xl text-center">
                          <XCircle className="w-8 h-8 text-slate-100 mx-auto mb-2" />
                          <div className="text-xs font-bold text-slate-300 italic">No hay criterios activos</div>
                        </div>
                      )}

                      {selectedReg.penalties && selectedReg.penalties.length > 0 && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                          <div className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Puntos Retirados
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {selectedReg.penalties.map((p: string, i: number) => (
                              <span key={i} className="text-[10px] text-red-700 font-bold bg-white px-2 py-0.5 rounded-lg border border-red-200">{p}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {selectedReg.statusHistory && selectedReg.statusHistory.length > 0 && (
                  <div className="mb-10">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Historial de Estado</h4>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-3">
                      {selectedReg.statusHistory.map((h: any, i: number) => (
                        <div key={i} className="flex flex-col gap-1 text-sm border-b border-slate-200/50 last:border-0 pb-3 last:pb-0">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest",
                              h.status === 'validado' || h.status === 'matricula_pendiente' ? "bg-emerald-100 text-emerald-700" : 
                              h.status === 'finalizado' ? "bg-slate-200 text-slate-700" :
                              h.status === 'espera_estudiante' ? "bg-blue-100 text-blue-700" :
                              h.status === 'rechazado' ? "bg-red-100 text-red-700" :
                              "bg-slate-200 text-slate-600"
                            )}>
                              {h.status.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              {new Date(h.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {h.note && <span className="text-xs text-slate-600 pl-1">{h.note}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {selectedReg.status === 'pendiente' && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Asignar Duración de Beca</div>
                      <div className="flex gap-2">
                        {[7, 14].map(days => (
                          <button
                            key={days}
                            onClick={() => handleStatusChange(selectedReg.code, 'matricula_pendiente', days as 7|14)}
                            className="flex-1 bg-white border border-slate-200 py-2 rounded-xl text-xs font-bold hover:border-primary hover:text-primary transition-all shadow-sm"
                          >
                            {days} Días
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedReg.status === 'matricula_pendiente' && (
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 mb-4 text-center">
                      <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Matrícula Asignada</div>
                      <p className="text-[11px] text-emerald-700 leading-tight italic">
                        Invitación de Coursera pendiente de envío ({selectedReg.assignedDuration} días).
                      </p>
                      <button 
                         onClick={() => handleStatusChange(selectedReg.code, 'validado')}
                         className="mt-3 w-full bg-emerald-600 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200"
                      >
                         Marcar como Enviado
                      </button>
                    </div>
                  )}

                  {selectedReg.status === 'validado' && (
                    <button 
                      onClick={() => handleStatusChange(selectedReg.code, 'finalizado')}
                      className="w-full bg-slate-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center justify-center gap-2 mb-4"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Marcar como Finalizado
                    </button>
                  )}

                  {selectedReg.status === 'finalizado' && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4 space-y-4">
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                          Resultado de la Beca
                        </div>
                        <select
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium"
                          defaultValue={selectedReg.scholarshipOutcome || 'en_curso'}
                          onChange={(e) => handleAssignmentUpdate('scholarshipOutcome', e.target.value)}
                        >
                          <option value="en_curso">En proceso (No Finalizada Aún)</option>
                          <option value="graduado">Beca Finalizada con Graduación</option>
                          <option value="suspendido">Beca Suspendida (Baja Prioridad)</option>
                        </select>
                      </div>

                      {selectedReg.scholarshipOutcome === 'graduado' && (
                        <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                            Conocimientos en Titulación (Reales)
                          </div>
                          <textarea 
                            rows={3}
                            placeholder="Ej: Dominio de Redes IP, Certificación CCNA, etc."
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium mb-3"
                            defaultValue={selectedReg.acquiredSkills || ''}
                            onBlur={(e) => handleAssignmentUpdate('acquiredSkills', e.target.value)}
                          />
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-200">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Certificado del Curso</div>
                        {!selectedReg.certificateUrl ? (
                          <div className="space-y-3">
                             <input type="text" placeholder="URL del archivo o enlace al PDF..." className="w-full text-sm p-3 rounded-lg border border-slate-200" id={`certUrlInput-${selectedReg.code}`} />
                             <button onClick={() => {
                               const el = document.getElementById(`certUrlInput-${selectedReg.code}`) as HTMLInputElement;
                               if(el && el.value) handleCertificateUpdate(selectedReg.code, el.value);
                             }} className="w-full bg-[#6427a1] text-white py-2 rounded-lg text-xs font-bold text-center mb-1">Cargar Certificado Externa</button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-center">
                             <a href={selectedReg.certificateUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-center hover:bg-slate-50 text-emerald-600">
                               <CheckCircle2 className="w-4 h-4" /> Certificado Añadido
                             </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(selectedReg.status === 'pendiente' || selectedReg.status === 'espera_estudiante') && (
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleStatusChange(selectedReg.code, 'espera_estudiante')}
                        className={cn(
                          "py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                          selectedReg.status === 'espera_estudiante' ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 text-slate-500 hover:bg-slate-50"
                        )}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Pedir Info
                      </button>
                      <button 
                        onClick={() => handleStatusChange(selectedReg.code, 'rechazado')}
                        className="py-3 rounded-2xl border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Rechazar
                      </button>
                    </div>
                  )}

                  {selectedReg.status === 'finalizado' && (
                    <div className="bg-slate-100 text-slate-600 p-4 rounded-2xl text-center text-xs font-black uppercase tracking-widest border border-slate-200 flex items-center justify-center gap-2">
                       <CheckCircle2 className="w-4 h-4" />
                      Curso Finalizado
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="p-12 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center opacity-50">
                <Eye className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-sm font-bold text-slate-400">Selecciona una solicitud para ver los detalles y validar documentos</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow-sm p-6 rounded-2xl border border-slate-100">
            <h2 className="text-xl font-black text-slate-900 mb-5">{editingCourseId ? 'Editar Curso' : 'Añadir Curso Cisco'}</h2>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Título del Curso</label>
                <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} placeholder="Ej: CCNAv7: Introduction to Networks" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Descripción</label>
                <textarea required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" value={newCourse.desc} onChange={e => setNewCourse({...newCourse, desc: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Duración</label>
                  <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" value={newCourse.duration} onChange={e => setNewCourse({...newCourse, duration: e.target.value})} placeholder="Ej: 70h" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Dificultad</label>
                  <select required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" value={newCourse.level} onChange={e => setNewCourse({...newCourse, level: e.target.value})}>
                    <option value="">Selecciona...</option>
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Plazas</label>
                  <input required type="number" min="1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" value={newCourse.plazas as any} onChange={e => setNewCourse({...newCourse, plazas: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Institución / Centro</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" value={newCourse.provider} onChange={e => setNewCourse({...newCourse, provider: e.target.value})} placeholder="Ej: Cisco Networking Academy" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nº Convocatoria</label>
                  <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" value={newCourse.callNumber} onChange={e => setNewCourse({...newCourse, callNumber: e.target.value})} placeholder="Ej: 1/2025" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Inicio Curso</label>
                  <input required type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" value={newCourse.courseStart} onChange={e => setNewCourse({...newCourse, courseStart: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Fin Curso</label>
                  <input required type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" value={newCourse.courseEnd} onChange={e => setNewCourse({...newCourse, courseEnd: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">URL Syllabus (PDF Externo)</label>
                  <input type="url" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" value={newCourse.syllabusUrl || ''} onChange={e => setNewCourse({...newCourse, syllabusUrl: e.target.value})} placeholder="https://drive.google..." />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">URL Insignia (PNG/JPG URL)</label>
                  <input type="url" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" value={newCourse.badgeUrl || ''} onChange={e => setNewCourse({...newCourse, badgeUrl: e.target.value})} placeholder="https://i.imgur.com/..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Inicio de Preinscripción</label>
                  <input required type="datetime-local" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" value={newCourse.enrollStart ? newCourse.enrollStart.slice(0, 16) : ''} onChange={e => setNewCourse({...newCourse, enrollStart: new Date(e.target.value).toISOString()})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Fin de Preinscripción</label>
                  <input required type="datetime-local" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" value={newCourse.enrollEnd ? newCourse.enrollEnd.slice(0, 16) : ''} onChange={e => setNewCourse({...newCourse, enrollEnd: new Date(e.target.value).toISOString()})} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Días concretos disponibles (fechas YYYY-MM-DD separadas por coma)</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" value={(newCourse.diasDisponibles || []).join(', ')} onChange={e => setNewCourse({...newCourse, diasDisponibles: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)})} placeholder="2026-08-12, 2026-08-19, 2026-08-26" />
                <p className="text-[10px] text-slate-400 font-medium mt-1">Estos son los días concretos que el alumno podrá elegir al solicitar la beca.</p>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="w-full btn-primary py-4 mt-4">{editingCourseId ? 'Actualizar Curso' : 'Crear Curso'}</button>
                {editingCourseId && (
                  <button type="button" onClick={() => { setEditingCourseId(null); setNewCourse({ title: '', desc: '', duration: '', level: '', institution: 'Cisco Networking Academy', plazas: 20, callNumber: 'UNED-2025-01', courseStart: '', courseEnd: '', badgeUrl: '', diasDisponibles: [] }); }} className="btn-secondary py-4 mt-4 px-6">Cancelar</button>
                )}
              </div>
            </form>
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-900 mb-5">Cursos Activos</h2>
            {courses.length === 0 ? (
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400">No hay cursos creados.</div>
            ) : (
              courses.map(c => (
                <div key={c.id} className={cn("bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between transition-all", (c as any).isHidden ? "border-slate-200 opacity-60 bg-slate-50" : "border-slate-100")}>
                  <div>
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                       {c.title}
                       {(c as any).isHidden && <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-slate-200 text-slate-500">Oculto</span>}
                    </h3>
                    <div className="text-xs text-slate-500 mt-1">{c.duration} • {c.plazas} plazas total</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button 
                      onClick={() => handleEditCourse(c)}
                      className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                      title="Editar curso"
                    >
                      <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </button>
                    <button 
                      onClick={() => handleViewSubscribers(c)}
                      className="p-2 rounded-xl border border-blue-200 text-blue-500 hover:bg-blue-50 transition-colors"
                      title="Ver suscriptores (avalar de apertura)"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleToggleCourseVisibility(c.id)}
                      className={cn("p-2 rounded-xl border transition-colors", (c as any).isHidden ? "bg-white border-slate-300 text-slate-600 hover:bg-slate-100" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600")}
                    >
                      {(c as any).isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <div className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hidden sm:block">
                      ID: {c.id}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {notifyModalCourse && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">Suscriptores</h3>
                <p className="text-slate-500 text-sm">{notifyModalCourse.title}</p>
              </div>
              <button onClick={() => setNotifyModalCourse(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><XCircle className="w-5 h-5 text-slate-600" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6">
                <span className="font-bold text-slate-700">Total suscritos:</span> {subscribers.length}
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-6">
                <h4 className="font-bold text-sm text-slate-700 mb-2">Lista de correos (Copiar y pegar en CCO):</h4>
                <div className="bg-white p-3 rounded border border-slate-200 text-xs text-slate-600 font-mono break-all selection:bg-primary/20">
                  {subscribers.map(s => s.email).join(', ') || 'Nadie suscrito aún.'}
                </div>
              </div>
              
              <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-4">
                <h4 className="font-bold text-sm text-slate-700 mb-2 flex items-center gap-2"><Copy className="w-4 h-4 text-blue-500" /> Plantilla de Email</h4>
                <textarea 
                  className="w-full h-48 bg-white border border-slate-200 rounded p-3 text-xs text-slate-600 font-mono" 
                  readOnly 
                  value={`Asunto: ¡La preinscripción para ${notifyModalCourse.title} está ABIERTA! 🎉

Hola,

Nos ponemos en contacto contigo porque solicitaste que te avisáramos cuando se abriera el plazo de preinscripción del curso "${notifyModalCourse.title}".

¡El momento ha llegado! El plazo de preinscripción ya está oficialmente activo. 

Te recordamos que las plazas son muy limitadas, así que no dejes pasar la oportunidad y envía tu solicitud cuanto antes.

Puedes consultar todos los detalles del curso y enviar tu solicitud directamente desde este enlace:
https://edu.laplaceta.org/cursos/${notifyModalCourse.id}

¡Te esperamos!

Un abrazo,
El equipo de La Placeta EDU`}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
