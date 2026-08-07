import express from "express";
import { CourseModel } from "../models/Course.js";

const router = express.Router();

// Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await CourseModel.find().lean();
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch courses", details: error.message });
  }
});

// Get a single course by ID
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const course = await CourseModel.findOne({ id } as any).lean();
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch course" });
  }
});

// Create a new course (Admin only)
router.post("/", async (req, res) => {
  const { 
    title, desc, duration, level, institution, plazas, 
    enrollStart, enrollEnd, emoji, cat, catLabel,
    provider, callNumber, courseStart, courseEnd,
    learningPoints, requirements, fullDesc
  } = req.body;
  
  if (!title || !desc || !duration || !level || !institution || !plazas) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const maxCourse = await CourseModel.findOne().sort('-id').exec();
    const nextId = maxCourse ? maxCourse.id + 1 : 1;

    const newCourse = new CourseModel({
      id: nextId,
      title,
      desc,
      duration,
      level,
      institution,
      plazas,
      isHidden: false,
      enrollStart,
      enrollEnd,
      emoji: emoji || '💻',
      cat: cat || 'tech',
      catLabel: catLabel || 'Tecnología',
      provider,
      callNumber,
      courseStart,
      courseEnd,
      learningPoints,
      requirements,
      fullDesc
    });

    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(500).json({ error: "Failed to create course" });
  }
});

// Update a course
router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;
  
  try {
    const course = await CourseModel.findOne({ id } as any);
    if (!course) return res.status(404).json({ error: "Course not found" });

    // Update allowed fields
    const allowedFields = ['title', 'desc', 'duration', 'level', 'institution', 'plazas', 'enrollStart', 'enrollEnd', 'emoji', 'cat', 'catLabel', 'provider', 'callNumber', 'courseStart', 'courseEnd', 'syllabusUrl', 'badgeUrl', 'learningPoints', 'requirements', 'fullDesc'];
    
    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        course[key] = updates[key];
      }
    }

    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: "Failed to update course" });
  }
});

// Toggle visibility of a course
router.patch("/:id/toggle", async (req, res) => {
  const id = parseInt(req.params.id);
  
  try {
    const course = await CourseModel.findOne({ id } as any);
    if (course) {
      course.isHidden = !course.isHidden;
      await course.save();
      res.json(course);
    } else {
      res.status(404).json({ error: "Course not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle course visibility" });
  }
});

import { NotificationModel } from "../models/Notification.js";

// Subscribe to course notifications
router.post("/:id/notify", async (req, res) => {
  const id = parseInt(req.params.id);
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  try {
    const exists = await NotificationModel.findOne({ courseId: id, email });
    if (!exists) {
      await NotificationModel.create({ courseId: id, email });
    }
    res.json({ success: true });
  } catch(error) {
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

// Get subscribers for a course
router.get("/:id/notifications", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const notifications = await NotificationModel.find({ courseId: id }).lean();
    res.json(notifications);
  } catch(error) {
    res.status(500).json({ error: "Failed to fetch" });
  }
});

export default router;
