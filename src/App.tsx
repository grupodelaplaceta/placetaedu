import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Tracking from './pages/Tracking';
import Legal from './pages/Legal';
import Admin from './pages/Admin';
import Bases from './pages/Bases';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import CourseDetail from './pages/CourseDetail';
import Feedback from './pages/Feedback';
import Calendar from './pages/Calendar';
import PublicProfile from './pages/PublicProfile';
import { AuthProvider } from './lib/auth';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="flex-grow"
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col selection:bg-primary/20 selection:text-primary">
          <Navbar />
          <PageTransition>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cursos" element={<Courses />} />
              <Route path="/cursos/:id" element={<CourseDetail />} />
              <Route path="/calendario" element={<Calendar />} />
              <Route path="/bases" element={<Bases />} />
              <Route path="/seguimiento" element={<Tracking />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/login" element={<Login />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/usuario/:id" element={<PublicProfile />} />
              <Route path="/feedback/:code" element={<Feedback />} />
            </Routes>
          </PageTransition>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
