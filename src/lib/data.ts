
export const COURSES: any[] = [];

// ── Franjas de días (lista establecida de horarios) ──────────────────────────
export interface ScheduleSlot {
  id: string;
  nombre: string;   // 'Mañanas' | 'Tardes' | ...
  dias: string;     // días concretos de la franja
  hora: string;     // rango horario
  emoji: string;
  chip: string;     // clases tailwind del icono (paleta oficial)
  ring: string;     // clases tailwind cuando está seleccionada
}

export const SCHEDULE_SLOTS: ScheduleSlot[] = [
  {
    id: 'manana_lmx',
    nombre: 'Mañanas',
    dias: 'Lunes, Miércoles y Viernes',
    hora: '09:00 – 11:00',
    emoji: '🌅',
    chip: 'bg-[#6321a5]/10 text-[#6321a5] border-[#6321a5]/20',
    ring: 'border-[#6321a5] bg-[#6321a5]/5 shadow-[#6321a5]/20',
  },
  {
    id: 'tarde_lmx',
    nombre: 'Tardes',
    dias: 'Lunes, Miércoles y Viernes',
    hora: '17:00 – 19:00',
    emoji: '🌇',
    chip: 'bg-[#4a08ce]/10 text-[#4a08ce] border-[#4a08ce]/20',
    ring: 'border-[#4a08ce] bg-[#4a08ce]/5 shadow-[#4a08ce]/20',
  },
  {
    id: 'manana_mj',
    nombre: 'Mañanas',
    dias: 'Martes y Jueves',
    hora: '09:00 – 11:00',
    emoji: '☀️',
    chip: 'bg-[#73b5c5]/15 text-[#3f8fa3] border-[#73b5c5]/25',
    ring: 'border-[#73b5c5] bg-[#73b5c5]/5 shadow-[#73b5c5]/20',
  },
  {
    id: 'tarde_mj',
    nombre: 'Tardes',
    dias: 'Martes y Jueves',
    hora: '17:00 – 19:00',
    emoji: '🌆',
    chip: 'bg-[#debd6b]/15 text-[#b9973f] border-[#debd6b]/30',
    ring: 'border-[#b9973f] bg-[#debd6b]/10 shadow-[#debd6b]/20',
  },
  {
    id: 'finde',
    nombre: 'Fines de Semana',
    dias: 'Sábado · Intensivo',
    hora: '10:00 – 13:00',
    emoji: '📅',
    chip: 'bg-[#de193a]/10 text-[#de193a] border-[#de193a]/20',
    ring: 'border-[#de193a] bg-[#de193a]/5 shadow-[#de193a]/20',
  },
  {
    id: 'flexible',
    nombre: 'Horario Flexible',
    dias: 'A tu ritmo · Sin clases en directo',
    hora: 'Autogestionado 24/7',
    emoji: '🕒',
    chip: 'bg-[#2a1740]/10 text-[#2a1740] border-[#2a1740]/20',
    ring: 'border-[#2a1740] bg-[#2a1740]/5 shadow-[#2a1740]/20',
  },
];

export const getScheduleSlot = (id?: string): ScheduleSlot | undefined =>
  SCHEDULE_SLOTS.find(s => s.id === id);

export const scheduleSlotLabel = (slot?: ScheduleSlot): string =>
  slot ? `${slot.nombre} · ${slot.dias} · ${slot.hora}` : '';

export const SCORING_CRITERIA = [
  { 
    id: 'desempleo', 
    label: 'Desempleo', 
    pts: 40, 
    icon: '💼',
    detail: 'Inscrito como demandante de empleo.',
    docs: 'Captura, foto o PDF de tu Vida Laboral o DARDE.'
  },
  { 
    id: 'exclusion', 
    label: 'Exclusión Social', 
    pts: 35, 
    icon: '⚠️',
    detail: 'Perceptor de ayudas o rentas mínimas.',
    docs: 'Captura, foto o PDF del justificante del IMV.'
  },
  { 
    id: 'monoparental', 
    label: 'Familia Monoparental', 
    pts: 30, 
    icon: '👨‍👩‍👧',
    detail: 'Un solo progenitor con hijos a cargo.',
    docs: 'Captura, foto o PDF del Título o Libro de Familia.'
  },
  { 
    id: 'estudiante', 
    label: 'Estudiante', 
    pts: 25, 
    icon: '🎓',
    detail: 'Estudiante matriculado con beca.',
    docs: 'Captura, foto o PDF de la matrícula o beca MEC.'
  },
  { 
    id: 'discapacidad', 
    label: 'Discapacidad', 
    pts: 20, 
    icon: '♿',
    detail: 'Grado de discapacidad ≥ 33%.',
    docs: 'Captura, foto o PDF del Certificado.'
  },
  { 
    id: 'recualificacion', 
    label: 'Recualificación', 
    pts: 15, 
    icon: '🔄',
    detail: 'Necesidad de cambio al sector digital.',
    docs: 'Captura, foto o PDF de tu Vida Laboral.'
  },
];
