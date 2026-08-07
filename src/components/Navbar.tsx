
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X, LogIn, LogOut, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/auth';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const { user, login, logout, loading } = useAuth();

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Bases', href: '/bases' },
    { name: 'Calendario Lectivo', href: '/calendario' },
    { name: 'Cursos', href: '/cursos' },
    { name: 'Seguimiento', href: '/seguimiento' },
    { name: 'Aviso Legal', href: '/legal' },
  ];

  const isAdmin = user && (
    user.email === 'malegre@laplaceta.org' ||
    user.role === 'admin' ||
    Object.values(user).some(val => 
      String(val).toLowerCase() === 'admin' || 
      String(val) === '54a133b218d989e5a89a7adb0290eda6' ||
      String(val).toUpperCase() === 'ADMIN-001'
    )
  );

  if (isAdmin) {
    navLinks.push({ name: 'Admin', href: '/admin' });
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 text-primary font-extrabold text-xl tracking-tight">
            <GraduationCap className="w-8 h-8" />
            <span>Placeta<span className="text-secondary">Edu</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === link.href ? "text-primary" : "text-slate-600"
                )}
              >
                {link.name}
              </Link>
            ))}
            
            {!loading && (
              user ? (
                <div className="flex items-center gap-4 ml-4">
                  <Link to="/perfil" className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-primary transition-colors bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <User className="w-4 h-4" />
                    Mi Perfil
                  </Link>
                  <button onClick={logout} className="text-slate-500 hover:text-red-500 transition-colors" title="Cerrar sesión">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login"
                  className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary-dark transition-colors shadow-sm"
                >
                  <LogIn className="w-4 h-4" />
                  Acceso
                </Link>
              )
            )}
            
            <Link to="/cursos" className="btn-primary py-2 text-sm shadow-lg shadow-primary/20 ml-2">
              Solicitar Beca
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-slate-600" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-primary/10 px-4 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "text-base font-medium p-2 rounded-lg",
                location.pathname === link.href ? "bg-primary/5 text-primary" : "text-slate-600"
              )}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="border-t border-slate-100 pt-4 mt-2">
            {!loading && user ? (
              <div className="flex flex-col gap-3">
                <Link to="/perfil" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-sm font-bold text-slate-700 px-2 py-2 hover:bg-slate-50 rounded-lg">
                  <User className="w-4 h-4 text-primary" />
                  Mi Perfil ({user.nombre || user.name || user.email || 'Usuario'})
                </Link>
                <button onClick={() => { logout(); setIsOpen(false); }} className="text-left text-sm font-bold text-slate-500 px-2 py-2 flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                onClick={() => setIsOpen(false)}
                className="bg-primary text-white w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                Acceso
              </Link>
            )}
          </div>
          <Link 
            to="/cursos" 
            onClick={() => setIsOpen(false)}
            className="btn-primary w-full text-center mt-2"
          >
            Solicitar Beca
          </Link>
        </div>
      )}
    </nav>
  );
}
