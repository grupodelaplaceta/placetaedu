import React from 'react';
import { ShieldCheck, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { SCORING_CRITERIA } from '../lib/data';

export default function Bases() {
  return (
    <div className="flex flex-col bg-white min-h-screen">
      <div className="bg-slate-50 border-b border-slate-100 pt-16 pb-12 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              Bases y <span className="text-primary italic">Requisitos</span>
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed font-medium">
              Consulta la información definitiva de la 1ª Convocatoria Becas Placeta Edu. 
              Garantizamos un acceso justo y transparente basado en criterios sociales y objetivos.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-4">Colectivos Prioritarios</h3>
              <ul className="space-y-3">
                {[
                  "Personas en situación de vulnerabilidad o riesgo de exclusión social",
                  "Familias numerosas",
                  "Familias monoparentales",
                  "Estudiantes de informática o áreas tecnológicas",
                  "Estudiantes interesados en la inteligencia artificial",
                  "Jóvenes en búsqueda de formación inicial",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-4">Requisitos de Participación</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span>Tener acceso a un dispositivo con conexión a internet</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span>Compromiso de finalización del curso</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span>Cumplir, en su caso, con los criterios de prioridad establecidos</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-ink p-6 rounded-2xl border border-white/10 shadow-md text-white">
              <h3 className="text-xl font-black mb-2">Plataforma Oficial</h3>
              <p className="text-sm text-slate-300 font-medium mb-4">
                Todas las solicitudes deben realizarse exclusivamente a través de 
                <strong className="text-white ml-1">edu.laplaceta.org</strong>
              </p>
              <div className="text-xs text-slate-400">
                Se requiere aportar datos personales, motivación y documentación acreditativa para los colectivos prioritarios.
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-6">Sistema de Puntuación Social</h2>
            <p className="text-slate-500 mb-8 font-medium">
              Asignamos las becas de forma justa y transparente. Durante tu solicitud podrás seleccionar los criterios que cumples para sumar puntos en tu expediente. Las plazas se asignarán en orden de puntuación.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {SCORING_CRITERIA.map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item.id}
                  className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start hover:bg-white hover:border-slate-300 transition-all duration-300"
                >
                  <div className="flex justify-between items-start w-full mb-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl border border-slate-100 shadow-sm">
                      {item.icon}
                    </div>
                    <div className="bg-primary/10 text-primary border border-primary/20 font-black px-2.5 py-1 rounded-lg text-xs">
                      +{item.pts} pts
                    </div>
                  </div>
                  <h4 className="font-black text-slate-900 text-base mb-2">{item.label}</h4>
                  <p className="text-slate-500 text-xs mb-4 leading-relaxed flex-grow font-medium">
                    {item.detail}
                  </p>
                  <div className="w-full pt-4 border-t border-slate-200 mt-auto">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Documento Requerido</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      {item.docs}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8">
              <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 px-5 py-3 rounded-xl shadow-sm border border-amber-200">
                <Star className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-sm font-bold">La documentación acreditativa es eliminada automáticamente tras validar tu solicitud.</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
