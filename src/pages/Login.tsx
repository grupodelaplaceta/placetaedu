import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Lock, Mail, User, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');
  const { loginWithEmail, registerWithEmail, loginWithPlaceta } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name);
      }
      navigate('/perfil');
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-20 px-4 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8 pb-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-center text-slate-900 mb-2">
            {isLogin ? 'Acceso al Área Personal' : 'Crear Cuenta'}
          </h2>
          <p className="text-center text-slate-500 text-sm mb-6">
            Gestiona tus inscripciones y descarga certificados
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="Tu nombre real"
                  />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="tu@correo.com"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-medium">
                {error}
              </div>
            )}

            <button type="submit" className="w-full btn-primary py-3">
              {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-500">
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            </span>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 font-bold text-primary hover:underline"
            >
              {isLogin ? 'Regístrate' : 'Inicia Sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
