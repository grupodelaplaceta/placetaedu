
import React from 'react';
import { Shield, FileText, Cookie, Database, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Legal() {
  const [activeTab, setActiveTab] = React.useState('privacidad');

  const tabs = [
    { id: 'privacidad', label: 'Privacidad', icon: Shield },
    { id: 'condiciones', label: 'Condiciones', icon: FileText },
    { id: 'cookies', label: 'Cookies', icon: Cookie },
    { id: 'rgpd', label: 'RGPD', icon: Database },
  ];

  const content: Record<string, React.ReactNode> = {
    privacidad: (
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-bold text-slate-900 mb-2">Responsable del tratamiento</h4>
          <p className="text-slate-600 leading-relaxed">Grupo de La Placeta (NIF: G27566900), con dominio principal laplaceta.org, es el responsable del tratamiento de los datos personales recogidos a través de PlacetaEdu.</p>
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-900 mb-2">Datos que recogemos</h4>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>Datos identificativos: nombre, apellidos, DNI/NIE, correo electrónico, teléfono.</li>
            <li>Datos socioeconómicos: situación laboral, renta, composición familiar (solo para valorar la puntuación de acceso).</li>
            <li>Datos de navegación: cookies técnicas necesarias para el funcionamiento del sitio.</li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-900 mb-2">Finalidad y Conservación</h4>
          <p className="text-slate-600 leading-relaxed">
            Los datos del formulario se usan exclusivamente para gestionar la solicitud de beca. 
          </p>
          <div className="mt-4 p-4 bg-primary/5 border border-primary/10 rounded-xl">
            <h5 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Política de verificación efímera</h5>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              La documentación enviada (capturas, fotos o PDFs) se solicita únicamente para la verificación manual de la puntuación declarada por el usuario. 
              <strong> Grupo de La Placeta (NIF: G27566900) no almacena ni conserva dichos documentos en ninguna base de datos </strong>. Una vez validada la puntuación, los archivos son eliminados permanentemente de nuestros sistemas de comunicación.
            </p>
          </div>
        </div>
      </div>
    ),
    condiciones: (
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-bold text-slate-900 mb-2">Naturaleza del programa</h4>
          <p className="text-slate-600 leading-relaxed">PlacetaEdu es un programa social sin ánimo de lucro de Grupo de La Placeta (NIF: G27566900). Las plazas son completamente gratuitas para los beneficiarios seleccionados bajo criterios de vulnerabilidad.</p>
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-900 mb-2">Compromisos del Becado</h4>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>Presentar documentación acreditativa en un plazo de 10 días hábiles.</li>
            <li>Comprometerse a completar al menos el 60% del curso asignado.</li>
            <li>No comercializar ni ceder el acceso a la plataforma otorgado.</li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-900 mb-2">Limitación de Responsabilidad</h4>
          <p className="text-slate-600 leading-relaxed">Grupo de La Placeta (NIF: G27566900) actúa como facilitador social. La disponibilidad técnica y contenidos finales dependen de la entidad certificadora.</p>
        </div>
      </div>
    ),
    cookies: (
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-bold text-slate-900 mb-2">Uso de Cookies</h4>
          <p className="text-slate-600 leading-relaxed">Esta web utiliza únicamente cookies técnicas estrictamente necesarias para el funcionamiento del sistema de solicitudes y seguimiento. No usamos cookies publicitarias.</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-700 font-medium">
          Dato: Al no usar cookies de terceros ni publicitarias, no se requiere el banner intrusivo de consentimiento según las directrices de la AEPD para cookies técnicas.
        </div>
      </div>
    ),
    rgpd: (
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-bold text-slate-900 mb-2">Transferencias Internacionales</h4>
          <p className="text-slate-600 leading-relaxed">Para la activación de la beca, los datos identificativos (nombre y email) se pueden transferir a la plataforma formativa bajo normativas aprobadas por la Comisión Europea.</p>
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-900 mb-2">DPO y Contacto</h4>
          <p className="text-slate-600 leading-relaxed">Para cualquier ejercicio de derechos ARCO (Acceso, Rectificación, Cancelación y Oposición), puede contactar con: <strong>dpd@laplaceta.org</strong>.</p>
        </div>
      </div>
    )
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-slate-900 leading-tight">Aviso Legal y Privacidad</h1>
            <div className="w-12 h-1.5 bg-primary rounded-full mt-2" />
          </div>
          
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all border text-left",
                activeTab === tab.id 
                  ? "bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105" 
                  : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
              )}
            >
              <tab.icon className="w-5 h-5 shrink-0" />
              {tab.label}
              {activeTab === tab.id && <ArrowRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </div>

        <div className="flex-1 glass-card rounded-[2rem] p-8 md:p-12">
          {content[activeTab]}
        </div>
      </div>
    </div>
  );
}
