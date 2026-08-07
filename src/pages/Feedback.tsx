import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, MessageSquare, Star } from 'lucide-react';

export default function Feedback() {
  const { code } = useParams();
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl shadow-primary/5 border border-slate-100"
        >
          <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Gracias por tu valoración!</h2>
          <p className="text-slate-600 mb-8">
            Tu opinión nos ayuda a mejorar y poder ofrecer mejores formaciones en el futuro.
          </p>
          <a href="/" className="btn-primary inline-flex items-center gap-2">
            Volver a inicio
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-2xl mb-4">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Valoración del Programa
          </h1>
          <p className="text-slate-600">
            Código de beca: <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-800 font-bold text-sm ml-1">{code}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl shadow-primary/5 border border-slate-100 p-8 space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-4">¿Cómo valorarías la formación recibida?</label>
            <div className="flex gap-2 justify-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  className={`p-2 transition-colors ${rating > i ? 'text-yellow-400' : 'text-slate-200 hover:text-yellow-200'}`}
                >
                  <Star className="w-10 h-10 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">¿Qué es lo que más te ha gustado?</label>
            <textarea 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              rows={3}
              placeholder="El contenido, el profesorado, la plataforma..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">¿En qué crees que podríamos mejorar?</label>
            <textarea 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              rows={3}
              placeholder="Dudas, sugerencias, aspectos a destacar..."
            />
          </div>

          <button 
            type="submit" 
            disabled={rating === 0}
            className="w-full btn-primary py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            Enviar valoración
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
