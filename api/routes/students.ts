import express from "express";
import { StudentModel } from "../models/Student.js";
import { CourseModel } from "../models/Course.js";
import { encrypt, decrypt } from "../lib/encryption.js";

const router = express.Router();

// Get all student registrations
router.get("/", async (req, res) => {
  try {
    const students = await StudentModel.find().lean();
    
    // Decrypt sensitive info for admin view
    const decryptedStudents = students.map((s: any) => ({
      ...s,
      dni: s.dni ? decrypt(s.dni) : s.dni
    }));

    // Sort by points descending, then by date ascending
    const sorted = decryptedStudents.sort((a: any, b: any) => {
      const aPoints = a.points || 0;
      const bPoints = b.points || 0;
      if (bPoints !== aPoints) return bPoints - aPoints;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// Get public anonymized list for transparency
router.get("/public/list", async (req, res) => {
  try {
    const students = await StudentModel.find({ 
      status: { $in: ['validado', 'matricula_pendiente', 'finalizado'] } 
    } as any).select('name code courseTitle points date validatedAt status').lean();
    
    const anonymized = students.map((s: any) => ({
      name: s.name.split(' ').map((n: string) => n[0] + '.').join(' '),
      code: s.code.replace(/-[A-Z0-9]{4}-/, '-****-'),
      course: s.courseTitle,
      points: s.points,
      date: s.date,
      status: s.status
    })).sort((a: any, b: any) => b.points - a.points);
    
    res.json(anonymized);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch public list" });
  }
});

// Register a student (Expediente)
router.post("/register", async (req, res) => {
  const data = req.body;
  if (!data.dni || !data.email) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  // Calculate default points if not provided
  let points = data.points || 0;
  
  const code = `PLC-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${new Date().getFullYear()}`;
  
  try {
    const newStudent = new StudentModel({
      ...data,
      dni: encrypt(data.dni),
      code,
      date: new Date().toISOString(),
      status: 'pendiente',
      statusHistory: [{ status: 'pendiente', note: 'Creación de la solicitud' }],
      points
    });

    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ error: "Failed to register student" });
  }
});

// Get a single student by code (Public version - strips PII)
router.get("/public/profile/:code", async (req, res) => {
  try {
    const student: any = await StudentModel.findOne({ code: req.params.code } as any).lean();
    if (!student) return res.status(404).json({ error: "No encontrado" });
    
    // Fetch associated course details
    if (student.courseId) {
      const course = await CourseModel.findOne({ id: student.courseId } as any).lean();
      student.courseDetails = course;
    }
    
    // Strip PII (Personally Identifiable Information)
    const publicProfile = {
      name: student.name.split(' ')[0] + ' ' + (student.name.split(' ')[1] ? student.name.split(' ')[1][0] + '.' : ''), // Just first name and initial
      code: student.code,
      status: student.status,
      courseTitle: student.courseTitle,
      points: student.points,
      date: student.date,
      courseDetails: student.courseDetails,
      certificateUrl: student.certificateUrl,
      acquiredSkills: student.acquiredSkills,
      scholarshipOutcome: student.scholarshipOutcome
    };
    
    res.json(publicProfile);
  } catch (error) {
    res.status(500).json({ error: "Get public profile error" });
  }
});

// Get a single student by code
router.get("/:code", async (req, res) => {
  try {
    const student: any = await StudentModel.findOne({ code: req.params.code } as any).lean();
    if (!student) return res.status(404).json({ error: "No encontrado" });
    
    student.dni = student.dni ? decrypt(student.dni) : student.dni;

    // Fetch associated course details if courseId exists
    if (student.courseId) {
      const course = await CourseModel.findOne({ id: student.courseId } as any).lean();
      student.courseDetails = course;
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: "Get student error" });
  }
});

// User reports they have finished
router.post("/:code/report-finished", async (req, res) => {
  try {
    const student = await StudentModel.findOne({ code: req.params.code } as any);
    if (!student) return res.status(404).json({ error: "No encontrado" });
    
    student.userReportedFinished = true;
    await student.save();
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error report-finished" });
  }
});

// Update registration status (Admin)
router.patch("/:code/status", async (req, res) => {
  const { code } = req.params;
  const { status, duration, certificateUrl, assignedAccount, assignedLicense, temporaryPassword, scholarshipStart, scholarshipEnd, callNumber, acquiredSkills, scholarshipOutcome, accountProvider, franja, franjaLabel } = req.body;
  
  try {
    const student = await StudentModel.findOne({ code } as any);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (status && student.status !== status) {
      student.statusHistory.push({
        status,
        date: new Date(),
        note: `Estado cambiado a ${status}`
      });
      student.status = status;
    }
    if (duration) student.assignedDuration = duration;
    if (certificateUrl) student.certificateUrl = certificateUrl;
    if (assignedAccount !== undefined) student.assignedAccount = assignedAccount;
    if (assignedLicense !== undefined) student.assignedLicense = assignedLicense;
    if (temporaryPassword !== undefined) student.temporaryPassword = temporaryPassword;
    if (scholarshipStart !== undefined) student.scholarshipStart = scholarshipStart;
    if (scholarshipEnd !== undefined) student.scholarshipEnd = scholarshipEnd;
    if (callNumber !== undefined) student.callNumber = callNumber;
    if (acquiredSkills !== undefined) student.acquiredSkills = acquiredSkills;
    if (scholarshipOutcome !== undefined) student.scholarshipOutcome = scholarshipOutcome;
    if (accountProvider !== undefined) student.accountProvider = accountProvider;
    if (callNumber !== undefined) student.callNumber = callNumber;
    if (franja !== undefined) student.franja = franja;
    if (franjaLabel !== undefined) student.franjaLabel = franjaLabel;
    
    if (status === 'validado' || status === 'matricula_pendiente') {
      student.set('files', []); 
      student.validatedAt = new Date().toISOString();
    }

    await student.save();
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

// Penalize points (Admin)
router.patch("/:code/penalty", async (req, res) => {
  const { code } = req.params;
  const { criteriaId, pointsToDeduct, criteriaLabel } = req.body;
  
  try {
    const student = await StudentModel.findOne({ code } as any);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    student.criterias = (student.criterias || []).filter((id: string) => id !== criteriaId);
    student.points = Math.max(0, student.points - pointsToDeduct);
    student.penalties = [...(student.penalties || []), criteriaLabel];

    await student.save();
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: "Failed to apply penalty" });
  }
});

// Update registration documents by student
router.patch("/:code/docs", async (req, res) => {
  const { code } = req.params;
  const { criterias, files, points, franja, franjaLabel } = req.body;
  
  try {
    const student = await StudentModel.findOne({ code } as any);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Only allow updating if it is still pending
    if (student.status !== 'pendiente') {
      return res.status(400).json({ error: "No se pueden modificar documentos de una solicitud que no está pendiente." });
    }

    if (criterias) student.criterias = criterias;
    if (files) student.files = files;
    if (points !== undefined) student.points = points;
    if (franja !== undefined) student.franja = franja;
    if (franjaLabel !== undefined) student.franjaLabel = franjaLabel;

    await student.save();
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: "Failed to update documents" });
  }
});

export default router;
