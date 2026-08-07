
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePreEnrollmentPDF = (registration: any) => {
  const doc = new jsPDF();
  const accentPurple = [124, 58, 237]; // Purple-600
  const accentGreen = [16, 185, 129]; // Emerald-500

  // Header
  doc.setFillColor(250, 245, 255);
  doc.rect(0, 0, 210, 45, 'F');
  
  doc.setTextColor(accentPurple[0], accentPurple[1], accentPurple[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text('LA PLACETA EDU', 20, 25);
  
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(10);
  doc.text('DOCUMENTO DE PRE-INSCRIPCIÓN OFICIAL', 20, 35);
  
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`CÓDIGO DE SEGUIMIENTO: ${registration.code}`, 135, 25);
  doc.text(`FECHA DE EMISIÓN: ${new Date().toLocaleDateString()}`, 135, 30);

  // Divider
  doc.setDrawColor(accentPurple[0], accentPurple[1], accentPurple[2]);
  doc.setLineWidth(1);
  doc.line(20, 45, 190, 45);

  // Section: Candidate
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.text('1. DATOS DEL SOLICITANTE', 20, 60);

  const personalData = [
    ['Nombre Completo', (registration.name || registration.nombre || 'N/A').toUpperCase()],
    ['Correo Electrónico', registration.email],
    ['Documento Identidad', registration.dni || 'No proporcionado'],
    ['Puntuación Beca', `${registration.points} Puntos`],
    ['Estado Solicitud', 'PENDIENTE DE VALIDACIÓN']
  ];

  autoTable(doc, {
    startY: 65,
    body: personalData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50, textColor: accentPurple as [number, number, number] } }
  });

  const finalY1 = (doc as any).lastAutoTable.finalY || 100;

  // Section: Course
  doc.setFontSize(14);
  doc.text('2. MEMORIA DEL PROGRAMA', 20, finalY1 + 15);

  const courseData = [
    ['Itinerario', registration.courseTitle || registration.title],
    ['Convocatoria', registration.callNumber || 'Activa'],
    ['Proveedor / Plataforma', registration.provider || registration.institution || 'Grupo de La Placeta'],
    ['Modalidad', '100% Online con Tutorización'],
    ['Coste de Matriculación', '0.00€ (Subvencionado por Beca)']
  ];

  autoTable(doc, {
    startY: finalY1 + 20,
    body: courseData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: accentPurple as any },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50, fillColor: [248, 250, 252] } }
  });

  const finalY2 = (doc as any).lastAutoTable.finalY || 160;

  // Section: Normativa
  doc.setFontSize(11);
  doc.setTextColor(accentPurple[0], accentPurple[1], accentPurple[2]);
  doc.text('3. NORMATIVA Y TÉRMINOS DE LA BECA', 20, finalY2 + 15);
  
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  const terms = [
    '- Esta pre-inscripción tiene una validez de 15 días naturales desde su emisión.',
    '- El acceso a la beca está sujeto a la validación de la documentación aportada.',
    '- Grupo de La Placeta se reserva el derecho de anulación si se detectan datos fraudulentos.',
    '- El beneficiario se compromete a finalizar al menos el 80% del contenido formativo.',
    '- Ley de Protección de Datos: Sus datos serán tratados exclusivamente para la gestión educativa.'
  ];
  let termY = finalY2 + 22;
  terms.forEach(term => {
    const lines = doc.splitTextToSize(term, 170);
    doc.text(lines, 20, termY);
    termY += lines.length * 4;
  });

  // Bottom Branding
  doc.setFillColor(accentPurple[0], accentPurple[1], accentPurple[2]);
  doc.rect(0, 285, 210, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('LA PLACETA EDU - Un programa social de Grupo de La Placeta (NIF: G27566900)', 105, 292, { align: 'center' });

  doc.save(`PreInscripcion_${registration.code}.pdf`);
};

export const generateEnrollmentPDF = (registration: any) => {
  const doc = new jsPDF();
  const accentPurple = [124, 58, 237];
  const accentGreen = [16, 185, 129];

  // Header
  doc.setFillColor(236, 253, 245);
  doc.rect(0, 0, 210, 50, 'F');
  
  doc.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('CERTIFICADO DE ADMISIÓN', 20, 25);
  
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`MATRÍCULA ACTIVA: ${registration.code}`, 135, 20);
  doc.text(`EXPEDIDO: ${new Date().toLocaleDateString()}`, 135, 25);

  // Main Card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  doc.roundedRect(15, 60, 180, 40, 3, 3, 'D');
  
  doc.setFontSize(14);
  doc.setTextColor(5, 150, 105);
  doc.text('FELICIDADES, TU BECA HA SIDO APROBADA', 105, 75, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  const welcomeText = doc.splitTextToSize(`Estimado/a ${registration.name || registration.nombre}, has sido admitido/a formalmente.`, 170);
  doc.text(welcomeText, 105, 85, { align: 'center' });

  // Details Table
  autoTable(doc, {
    startY: 110,
    head: [['CONCEPTO', 'DETALLE DE LA MATRÍCULA']],
    body: [
      ['Programa', registration.courseTitle || registration.title],
      ['Convocatoria', registration.callNumber || 'N/A'],
      ['Institución Emisora', registration.institution || 'Cisco Academy'],
      ['Cuenta de Acceso', registration.assignedAccount || registration.email],
      ['Password Temporal', registration.temporaryPassword || '**** (Manual)'],
      ['Periodo de Beca', `Del ${registration.scholarshipStart || 'TBD'} al ${registration.scholarshipEnd || 'TBD'}`],
      ['Licencia Asignada', registration.assignedLicense || 'Canva Pro Educativo'],
      ['Estado de Beca', 'ACTIVA AL 100% (SUBVENCIONADA)']
    ],
    theme: 'striped',
    headStyles: { fillColor: accentGreen as any },
    styles: { fontSize: 9, cellPadding: 4, overflow: 'linebreak' },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 }, 1: { cellWidth: 120 } }
  });

  const finalY3 = (doc as any).lastAutoTable.finalY || 180;

  // Conditions Section
  doc.setFontSize(12);
  doc.setTextColor(accentPurple[0], accentPurple[1], accentPurple[2]);
  doc.text('COMPROMISO DEL ESTUDIANTE', 20, finalY3 + 15);
  
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  const conditions = [
    '1. El alumno declara conocer el plan de estudios y los requisitos técnicos de acceso.',
    '2. La beca incluye todos los derechos de examen y acceso a materiales por tiempo limitado.',
    '3. Se requiere un progreso constante. 30 días de inactividad pueden causar la baja automática.',
    '4. El certificado final se emitirá tras la superación de las pruebas de evaluación.',
    '5. Este documento tiene validez legal como comprobante de matrícula a efectos administrativos.'
  ];
  let conditionY = finalY3 + 22;
  conditions.forEach(cond => {
    const lines = doc.splitTextToSize(cond, 170);
    doc.text(lines, 20, conditionY);
    conditionY += lines.length * 4;
  });

  // Digital Stamp
  doc.setDrawColor(accentGreen[0], accentGreen[1], accentGreen[2]);
  doc.setLineWidth(0.5);
  doc.ellipse(160, Math.max(conditionY + 20, 240), 32, 16);
  doc.setFontSize(6);
  doc.text('VALIDADO DIGITALMENTE POR', 160, Math.max(conditionY + 20, 240) - 4, { align: 'center' });
  doc.text('GRUPO DE LA PLACETA', 160, Math.max(conditionY + 20, 240), { align: 'center' });
  doc.text('NIF: G27566900', 160, Math.max(conditionY + 20, 240) + 4, { align: 'center' });
  doc.text(registration.code, 160, Math.max(conditionY + 20, 240) + 8, { align: 'center' });

  doc.save(`Matricula_${registration.code}.pdf`);
};



export const generateCourseGroupReportPDF = (courseTitle: string, registrations: any[]) => {
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for more columns
  const accentSlate = [15, 23, 42]; // Slate-900
  const accentPrimary = [124, 58, 237]; // Purple-600

  // Header Brand
  doc.setFillColor(accentSlate[0], accentSlate[1], accentSlate[2]);
  doc.rect(0, 0, 297, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('REPORTE DE CONVOCATORIA - GRUPO DE LA PLACETA', 20, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text(`ITINERARIO: ${courseTitle.toUpperCase()}`, 20, 30);
  doc.text(`EXTRACCIÓN: ${new Date().toLocaleString()}`, 230, 30);

  // Stats Summary Box
  const stats = {
    total: registrations.length,
    validated: registrations.filter(r => ['validado', 'matricula_pendiente', 'finalizado'].includes(r.status)).length,
    pending: registrations.filter(r => r.status === 'pendiente').length,
    avgPoints: registrations.reduce((acc, r) => acc + r.points, 0) / (registrations.length || 1)
  };

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 45, 257, 20, 2, 2, 'F');
  doc.setTextColor( accentSlate[0], accentSlate[1], accentSlate[2]);
  doc.setFontSize(9);
  doc.text(`TOTAL INSCRITOS: ${stats.total}`, 30, 57);
  doc.text(`BECAS ADMITIDAS: ${stats.validated}`, 90, 57);
  doc.text(`SOLICITUDES PENDIENTES: ${stats.pending}`, 160, 57);
  doc.text(`PROMEDIO PUNTOS: ${stats.avgPoints.toFixed(1)}`, 230, 57);

  // Main Table
  const tableData = registrations.map((r, i) => [
    i + 1,
    r.code,
    r.name.toUpperCase(),
    r.points,
    r.status.toUpperCase().replace('_', ' '),
    r.assignedAccount || '-',
    r.callNumber || 'N/A'
  ]);

  autoTable(doc, {
    startY: 70,
    head: [['#', 'CÓDIGO', 'ESTUDIANTE', 'PTS', 'ESTADO', 'CUENTA ASIGNADA', 'CONVOCATORIA']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: accentSlate as any,
      fontSize: 8,
      halign: 'center'
    },
    styles: { 
      fontSize: 8,
      cellPadding: 3
    },
    columnStyles: {
      0: { halign: 'center', fontStyle: 'bold' },
      1: { halign: 'center' },
      3: { halign: 'center', fontStyle: 'bold' },
      4: { halign: 'center' }
    }
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Página ${i} de ${pageCount} - Documento Confidencial para Gestión Administrativa. (Grupo de La Placeta - NIF: G27566900)`, 148, 205, { align: 'center' });
  }

  doc.save(`Reporte_Grupo_${courseTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const getEnrollmentEmailTemplate = (registration: any) => {
  const accountInfo = registration.assignedAccount ? `${registration.assignedAccount} (${registration.accountProvider || 'Plataforma'})` : 'Usa tu email personal';
  const licenseInfo = registration.assignedLicense ? `LICENCIAS: ${registration.assignedLicense}\n` : '';
  const removalWarning = (registration.assignedAccount || registration.assignedLicense) ? '\nIMPORTANTE: Recuerda que las cuentas (Google/Microsoft) y licencias proporcionadas (ej: Canva Pro) son temporales y se retirarán automáticamente al finalizar el curso.\n' : '';

  const isCisco = registration.institution?.toLowerCase().includes('cisco') || registration.provider?.toLowerCase().includes('cisco');
  
  const accessMethod = isCisco 
    ? `1. Accede con tu correo de solicitud a la web oficial de Cisco Networking Academy (https://www.netacad.com).
2. Inicia sesión o recupera contraseña si es la primera vez.
3. El curso asignado te aparecerá directamente en tu panel ('Estoy aprendiendo').`
    : `1. Ve a https://edu.laplaceta.org e inicia sesión.
2. Introduce tus credenciales enviadas en este mensaje.`;

  return `
Asunto: ¡Bienvenido/a! Tu Beca de Grupo de La Placeta ha sido activada - ${registration.code}

Hola ${registration.name || registration.nombre},

Nos alegra comunicarte que tu solicitud para el curso "${registration.courseTitle || registration.title}" ha sido VALIDADA con éxito. 

Aquí tienes tus credenciales y próximos pasos:

PLATAFORMA: ${registration.institution || 'Plataforma'}
CUENTA ASIGNADA: ${accountInfo}
PASSWORD TEMPORAL: ${registration.temporaryPassword || 'TBD'}
PERIODO BECA: Del ${registration.scholarshipStart || 'TBD'} al ${registration.scholarshipEnd || 'TBD'}
${licenseInfo}
ACCESO:
${accessMethod}

Tienes hasta el ${registration.scholarshipEnd || 'finalizar el curso'} para completar el itinerario formativo (se recomienda 2-3h semanales).
${removalWarning}
Si tienes dudas, contacta con edu@laplaceta.org

¡Mucho éxito en tu formación!

Atentamente,
El equipo de Placeta Edu
Un programa de Grupo de La Placeta (NIF: G27566900)
edu@laplaceta.org
  `.trim();
};

export const getCompletionEmailTemplate = (registration: any) => {
  const feedbackLink = `https://edu.laplaceta.org/feedback/${registration.code}`;
  
  const quotes = [
    "\"La educación es el arma más poderosa que puedes usar para cambiar el mundo.\" - Nelson Mandela",
    "\"La mente que se abre a una nueva idea, jamás volverá a su tamaño original.\" - Albert Einstein",
    "\"Vive como si fueras a morir mañana. Aprende como si fueras a vivir siempre.\" - Mahatma Gandhi",
    "\"La educación no es llenar un cubo, sino encender un fuego.\" - William Butler Yeats",
    "\"Aprender sin reflexionar es malgastar la energía.\" - Confucio",
    "\"El aprendizaje nunca agota la mente.\" - Leonardo da Vinci"
  ];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return `
Asunto: 🏆 ¡Enhorabuena! Has finalizado tu formación en Placeta Edu - ${registration.code}

¡Hola ${registration.name || registration.nombre}! 👋

¡Muchísimas felicidades! 🎉 Nos hace mucha ilusión comunicarte que has completado satisfactoriamente tu beca formativa en el curso:
"${registration.courseTitle || registration.title}".

Tu esfuerzo y dedicación han dado sus frutos. Como recordatorio, en los próximos días procederemos a retirar el acceso a las licencias y cuentas cedidas por la asociación. No olvides descargar cualquier material o archivo que desees conservar.

Tu diploma oficial estará disponible en tu panel de usuario en las próximas 24-48 horas.

---
💡 Una pequeña reflexión para el camino:
${randomQuote}
---

Nos encantaría que dedicaras un minuto a valorar tu experiencia para ayudarnos a becar a más estudiantes:
⭐ Enlace de valoración: ${feedbackLink}

¡Te deseamos todo lo mejor en tus próximos retos profesionales! 🚀

Un fuerte abrazo de parte de todo el equipo,
Placeta Edu - Grupo de La Placeta
edu@laplaceta.org
  `.trim();
};
