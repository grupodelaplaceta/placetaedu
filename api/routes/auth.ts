import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret1234';

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    
    const existing = await UserModel.findOne({ email } as any);
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = email === 'malegre@laplaceta.org' ? 'admin' : 'student';
    const user = new UserModel({
      email,
      password: hashedPassword,
      name,
      role: userRole
    });
    
    await user.save();
    
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }
    
    const user = await UserModel.findOne({ email } as any);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

router.put('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    const { name, email } = req.body;
    const user = await UserModel.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (name) user.name = name;
    if (email && email !== user.email) {
       const existing = await UserModel.findOne({ email } as any);
       if (existing) return res.status(400).json({ error: 'Email already in use' });
       user.email = email;
    }
    await user.save();
    
    const newToken = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token: newToken, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/public/:id', async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Find students records for this user (using email as reference since we do not have userId in StudentModel maybe?)
    // Let's check how StudentModel connects to User
    const registrations = await mongoose.models.Student.find({ email: user.email }).lean();
    
    // Filter out only completed or public info?
    // Actually the user wanted "mis inscripciones" to be public maybe? 
    // They said "se puede añadir una insignia en png del curso para que aparezca en un perfil publico del estudiante y si posas encima aoarece el numero de beca para que se pueda validar, Perfiles compartibles y publicos. los perfiles publicos son de cada usuario"
    const publicRegistrations = registrations.map((r: any) => ({
      code: r.code,
      courseTitle: r.courseTitle,
      courseId: r.courseId,
      status: r.status,
      date: r.date,
      certificateUrl: r.certificateUrl,
      scholarshipOutcome: r.scholarshipOutcome
    }));

    const courseIds = publicRegistrations.map((r: any) => r.courseId);
    const courses = await mongoose.models.Course.find({ id: { $in: courseIds } }).lean();
    const courseMap = courses.reduce((acc: any, c: any) => {
      acc[c.id] = c;
      return acc;
    }, {});

    const enrichedRegistrations = publicRegistrations.map((r: any) => ({
      ...r,
      courseDetails: courseMap[r.courseId] || null
    }));

    res.json({
      id: user._id,
      name: user.name,
      registrations: enrichedRegistrations
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
