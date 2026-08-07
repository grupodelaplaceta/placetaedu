import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dni: { type: String, required: true },
  email: { type: String, required: true },
  courseId: { type: Number, required: true },
  courseTitle: { type: String, required: true },
  criterias: [{ type: String }],
  files: [{
    criteria: String,
    name: String
  }],
  points: { type: Number, default: 0 },
  code: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  status: { type: String, default: 'pendiente' },
  assignedDuration: { type: String },
  validatedAt: { type: String },
  penalties: [{ type: String }],
  certificateUrl: { type: String },
  assignedAccount: { type: String },
  accountProvider: { type: String },
  assignedLicense: { type: String },
  temporaryPassword: { type: String },
  callNumber: { type: String },
  scholarshipStart: { type: String },
  scholarshipEnd: { type: String },
  acquiredSkills: { type: String },
  scholarshipOutcome: { type: String, enum: ['en_curso', 'graduado', 'suspendido'], default: 'en_curso' },
  statusHistory: [{
    status: String,
    date: { type: Date, default: Date.now },
    note: String
  }],
  userReportedFinished: { type: Boolean, default: false }
}, { timestamps: true });

export const StudentModel = mongoose.models.Student || mongoose.model('Student', studentSchema);
