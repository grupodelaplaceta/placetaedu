import mongoose from 'mongoose';
import { CourseModel } from './models/Course.js';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://gdlp1:pass1@placeta.4emiiva.mongodb.net/?appName=Placeta";

let cachedPromise: Promise<typeof mongoose> | null = null;

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  
  if (cachedPromise) {
    await cachedPromise;
    return;
  }
  
  try {
    console.log("Connecting to MongoDB with URI:", MONGODB_URI.substring(0, 20) + "...");
    cachedPromise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    const conn = await cachedPromise;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed data if empty
    const count = await CourseModel.countDocuments();
    console.log("Current course count:", count);
    if (count === 0) {
      console.log("Seeding initial courses...");
      await CourseModel.insertMany([
        { 
          id: 1, 
          title: 'Cisco CCNAv7: Intro to Networks', 
          desc: 'El primer paso hacia tu certificación CCNA. Arquitecturas de red, modelos y protocolos.', 
          duration: '70h', 
          level: 'Principiante', 
          institution: 'Cisco Networking Academy', 
          plazas: 20,
          isHidden: false,
          emoji: '🌐',
          cat: 'tech',
          catLabel: 'Tecnología',
          provider: 'Cisco Academy',
          callNumber: 'CONV-2025-01',
          courseStart: '2025-05-01',
          courseEnd: '2025-07-30',
          syllabusUrl: 'https://www.netacad.com/sites/default/files/images/itn-course-outline.pdf',
          fullDesc: 'Este itinerario profesional profundiza en la protección de redes, sistemas y datos. Ideal para aquellos que buscan una carrera en seguridad de la información.',
          learningPoints: ['Modelos OSI y TCP/IP', 'Configuración de Switches y Routers', 'IPv4 e IPv6 addressing', 'Network Security basics'],
          requirements: ['Ganas de aprender', 'Inglés técnico básico']
        },
        { 
          id: 2, 
          title: 'Google Data Analytics Professional', 
          desc: 'Certificación oficial para iniciar tu carrera en el análisis de datos.', 
          duration: '80h', 
          level: 'Intermedio', 
          institution: 'Google / Coursera', 
          plazas: 15,
          isHidden: false,
          emoji: '📊',
          cat: 'tech',
          catLabel: 'Tecnología',
          provider: 'Coursera',
          callNumber: 'CONV-2025-01',
          courseStart: '2025-05-15',
          courseEnd: '2025-08-15',
          syllabusUrl: 'https://cdn.coursera.org/syllabus/google-data-analytics.pdf',
          fullDesc: 'Prepárate para un rol de nivel inicial en análisis de datos. Aprenderás a procesar y analizar datos para la toma de decisiones.',
          learningPoints: ['Excel y SQL', 'Visualización con Tableau', 'Lenguaje R', 'Limpieza de datos'],
          requirements: ['Mentalidad analítica', 'Sin experiencia previa necesaria']
        },
        { 
          id: 3, 
          title: 'Diseño Creativo con Canva Pro', 
          desc: 'Domina las herramientas de diseño para optimizar procesos creativos.', 
          duration: '30h', 
          level: 'Principiante', 
          institution: 'La Placeta EDU', 
          plazas: 30,
          isHidden: false,
          emoji: '🎨',
          cat: 'creative',
          catLabel: 'Creatividad',
          provider: 'Canva',
          callNumber: 'CONV-2025-02',
          courseStart: '2025-06-01',
          courseEnd: '2025-06-30',
          syllabusUrl: 'https://design.canva.com/syllabus/visual-design-fundamentals.pdf',
          fullDesc: 'Aprende a diseñar materiales para RRSS, presentaciones e identidad visual de marca de manera profesional.',
          learningPoints: ['Teoría del color', 'Tipografía', 'Brand Design', 'Canva Pro Tools'],
          requirements: ['Creatividad', 'Manejo básico de internet']
        }
      ] as any);
      console.log('Database seeded with initial courses.');
    }
  } catch (error) {
    cachedPromise = null;
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}
