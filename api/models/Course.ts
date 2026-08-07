import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  desc: { type: String, required: true },
  duration: { type: String, required: true },
  level: { type: String, required: true },
  institution: { type: String, required: true },
  plazas: { type: Number, required: true },
  isHidden: { type: Boolean, default: false },
  emoji: { type: String, default: '💻' },
  cat: { type: String, default: 'tech' },
  catLabel: { type: String, default: 'Tecnología' },
  enrollStart: { type: String },
  enrollEnd: { type: String },
  provider: { type: String, default: 'La Placeta EDU' },
  callNumber: { type: String, default: '1/2025' },
  courseStart: { type: String },
  courseEnd: { type: String },
  learningPoints: [{ type: String }],
  requirements: [{ type: String }],
  fullDesc: { type: String },
  syllabusUrl: { type: String },
  badgeUrl: { type: String }
});

export const CourseModel = mongoose.models.Course || mongoose.model('Course', courseSchema);
