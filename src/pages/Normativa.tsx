import React from 'react';
import { motion } from 'motion/react';
import { FileText, ShieldCheck, ExternalLink, BookOpen } from 'lucide-react';
import normativaMd from '../data/normativa-placedu.md?raw';

function inline(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((p, i) =>
    i % 2 === 1
      ? <strong key={i} className="font-black text-slate-900">{p}</strong>
      : <React.Fragment key={i}>{p}</React.Fragment>
  );
}

interface Bloque {
  tipo: 'titulo' | 'articulo' | 'sub' | 'parrafo' | 'num' | 'bullets';
  texto?: string;
  num?: string;
  items?: string[];
}

function parsear(): { bloques: Bloque[]; indice: { id: string; texto: string }[] } {
  const bloques: Bloque[] = [];
  const indice: { id: string; texto: string }[] = [];
  let parrafo: string[] = [];

  const flush = () => {
    if (!parrafo.length) return;
    const t = parrafo.join(' ');
    const num = t.match(/^(\d+)\.\s+(.*)$/);
    if (num) {
      bloques.push({ tipo: 'num', num: num[1], texto: num[2] });
    } else if (t.startsWith('- ')) {
      bloques.push({ tipo: 'bullets', items: t.split(/\s+-\s+/).filter(Boolean) });
    } else {
      bloques.push({ tipo: 'parrafo', texto: t });
    }
    parrafo = [];
  };

  normativaMd.split('\n').forEach(line => {
    const t = line.trim();
    if (t.startsWith('# ')) {
      flush();
      const id = `t-${bloques.length}`;
      indice.push({ id, texto: t.slice(2).replace(/\*\*/g, '') });
      bloques.push({ tipo: 'titulo', texto: t.slice(2), num: id });
    } else if (t.startsWith('## ')) {
      flush();
      bloques.push({ tipo: 'articulo', texto: t.slice(3) });
    } else if (t.startsWith('### ')) {
      flush();
      bloques.push({ tipo: 'sub', texto: t.slice(4) });
    } else if (t === '') {
      flush();
    } else {
      parrafo.push(t);
    }
  });
  flush();
  return { bloques, indice };
}

export default function Normativa() {
  const { bloques, indice } = React.useMemo(parsear, []);

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      {/* Cabecera */}
      <div className="bg-ink relative overflow-hidden text-white pt-20 pb-14 mb-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-3xl rounded-full translate-x-24 -translate-y-24"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/80 mb-5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> CNI-PEDU · Normativa oficial del programa
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Normativa del programa <span className="text-primary italic">PlacetaEDU</span>
          </h1>
          <p className="text-slate-300 font-medium max-w-2xl leading-relaxed">
            Regula la organización, funcionamiento, acceso, participación y certificación del programa formativo
            promovido por <strong className="text-white">Grupo de La Placeta</strong>.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5 bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg"><FileText className="w-3.5 h-3.5 text-primary" /> 17 títulos · 38 artículos</span>
            <a href="https://bop.laplaceta.org/documento.html?codigo=CNI-PEDU" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-lg hover:brightness-110 transition-all">
              <ExternalLink className="w-3.5 h-3.5" /> Ver en el BOP
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 w-full">
        {/* Índice */}
        {indice.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-10">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">Índice</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {indice.map((it, i) => (
                <a key={it.id} href={`#${it.id}`} className="text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:border-primary hover:text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-all">
                  {i + 1}. {it.texto}
                </a>
              ))}
            </div>
          </motion.div>
        )}

        {/* Cuerpo */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 md:p-14">
          {bloques.map((b, i) => {
            if (b.tipo === 'titulo') {
              return (
                <h2 key={i} id={b.num} className="scroll-mt-24 text-2xl md:text-3xl font-black text-primary mb-6 mt-12 first:mt-0 leading-tight">
                  {inline(b.texto || '')}
                </h2>
              );
            }
            if (b.tipo === 'articulo') {
              return (
                <h3 key={i} className="text-lg md:text-xl font-black text-slate-900 mb-4 mt-8 leading-tight">
                  {inline(b.texto || '')}
                </h3>
              );
            }
            if (b.tipo === 'sub') {
              return <h4 key={i} className="text-base font-black text-slate-700 mb-3 mt-6">{inline(b.texto || '')}</h4>;
            }
            if (b.tipo === 'num') {
              return (
                <div key={i} className="flex gap-4 mb-3 items-start">
                  <span className="shrink-0 w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-black flex items-center justify-center mt-0.5">{b.num}</span>
                  <p className="text-[15px] text-slate-600 leading-relaxed font-medium">{inline(b.texto || '')}</p>
                </div>
              );
            }
            if (b.tipo === 'bullets') {
              return (
                <ul key={i} className="space-y-2 mb-3">
                  {(b.items || []).map((it, j) => (
                    <li key={j} className="flex items-start gap-3 text-[15px] text-slate-600 font-medium">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                      <span>{inline(it)}</span>
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={i} className="text-[15px] text-slate-600 leading-relaxed font-medium mb-3">
                {inline(b.texto || '')}
              </p>
            );
          })}

          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-400 font-medium">
              Documento oficial <strong className="text-slate-600">CNI-PEDU</strong> · Boletín Oficial de La Placeta · Grupo de La Placeta (NIF: G27566900)
            </div>
            <a href="https://bop.laplaceta.org/documento.html?codigo=CNI-PEDU" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary transition-colors">
              <ExternalLink className="w-4 h-4" /> Descargar del BOP
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
