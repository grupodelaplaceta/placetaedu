
import React from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import CourseCard, { type Course } from '../components/CourseCard';
import EnrollModal from '../components/EnrollModal';

export default function Courses() {
  const [filter, setFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/courses')
      .then(r => { if (!r.ok) throw new Error('API Error'); return r.json(); })
      .then(data => {
        setCourses(data.filter((c: any) => !c.isHidden));
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading courses", err);
        setLoading(false);
      });
  }, []);

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'tech', label: 'Tecnología' },
    { id: 'data', label: 'Datos & IA' },
    { id: 'business', label: 'Negocios' },
    { id: 'design', label: 'Diseño' },
    { id: 'idiomas', label: 'Idiomas' },
  ];

  const filteredCourses = courses.filter(course => {
    const matchesFilter = filter === 'all' || course.cat === filter;
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) || 
                          course.institution.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
     return <div className="max-w-7xl mx-auto px-4 py-24 flex items-center justify-center text-center text-slate-400 font-bold tracking-widest uppercase text-sm">Cargando cursos...</div>;
  }

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      <div className="bg-white border-b border-slate-100 pt-10 pb-8 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
              Catálogo de <span className="text-primary italic">Cursos</span>
            </h1>
            <p className="text-base text-slate-500 leading-relaxed font-medium">
              Selecciona el programa que mejor se adapte a tus objetivos. Ofrecemos formación gratuita y oficial en colaboración con Cisco y nuestras entidades asociadas.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8 pb-16">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Buscar por título o universidad..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-slate-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-1.5 w-full md:w-auto px-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  filter === cat.id 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <div key={course.id} className="hover:-translate-y-1 transition-transform duration-300">
                <CourseCard 
                  course={course} 
                  onEnroll={() => setSelectedCourse(course)} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl mb-6 border border-slate-100">
              🔍
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No encontramos resultados</h3>
            <p className="text-slate-500 font-medium mb-6 max-w-sm">No tenemos cursos que coincidan con tu búsqueda actual. Prueba a cambiar los filtros.</p>
            <button 
              onClick={() => { setFilter('all'); setSearch(''); }}
              className="bg-primary text-white px-6 py-3 rounded-xl text-sm font-bold shadow-sm hover:bg-primary-dark transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      <EnrollModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />
    </div>
  );
}
