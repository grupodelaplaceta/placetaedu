import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  courseId: { type: Number, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const NotificationModel = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
