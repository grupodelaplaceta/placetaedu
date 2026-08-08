
import { Mail, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-ink text-slate-300 py-12 px-4 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
        <div>
          <div className="flex items-center mb-4 justify-center md:justify-start">
            <img src="/pledulogo.png" alt="PlacetaEdu" className="h-10 w-auto" />
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            Un programa social de Grupo de La Placeta (NIF: G27566900) para democratizar la educación de alta calidad.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-white font-bold mb-2">Contacto</h4>
          <a href="mailto:edu@laplaceta.org" className="flex items-center gap-2 hover:text-accent transition-colors justify-center md:justify-start text-sm">
            <Mail className="w-4 h-4" /> edu@laplaceta.org
          </a>
          <a href="https://edu.laplaceta.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent transition-colors justify-center md:justify-start text-sm">
            <Globe className="w-4 h-4" /> edu.laplaceta.org
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-white font-bold mb-2">Legal</h4>
          <Link to="/normativa" className="text-sm hover:text-white transition-colors">Normativa del programa</Link>
          <Link to="/legal" className="text-sm hover:text-white transition-colors">Política de Privacidad</Link>
          <Link to="/legal" className="text-sm hover:text-white transition-colors">Términos y Condiciones</Link>
          <Link to="/legal" className="text-sm hover:text-white transition-colors">Cookies</Link>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 text-xs text-center text-slate-500">
        <p>© 2025 Grupo de La Placeta (NIF: G27566900). Las plazas en cursos se ofrecen bajo acuerdo colaborativo para fines sociales.</p>
      </div>
    </footer>
  );
}
