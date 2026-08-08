
export const COURSES: any[] = [];

// ── Días específicos (fechas concretas del calendario) ───────────────────────
// El alumno elige UN día concreto de la lista de fechas disponibles del curso
// (NO horas ni días de la semana recurrentes).

export function parseFecha(iso?: string): Date | null {
  if (!iso) return null;
  const d = new Date(String(iso).slice(0, 10) + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

/** "12 de agosto de 2026" */
export function formatFechaLarga(iso?: string): string {
  const d = parseFecha(iso);
  if (!d) return '';
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** "12 ago" */
export function formatFechaCorta(iso?: string): string {
  const d = parseFecha(iso);
  if (!d) return '';
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

/** "Miércoles" */
export function formatDiaSemana(iso?: string): string {
  const d = parseFecha(iso);
  if (!d) return '';
  const s = d.toLocaleDateString('es-ES', { weekday: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

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
