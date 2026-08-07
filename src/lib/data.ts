
export const COURSES: any[] = [];

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
