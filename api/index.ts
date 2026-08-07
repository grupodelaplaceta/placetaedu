import express from "express";
import rateLimit from "express-rate-limit";
import coursesRouter from "./routes/courses.js";
import studentsRouter from "./routes/students.js";
import authRouter from "./routes/auth.js";
import { connectDB } from "./db.js";

const app = express();

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
  standardHeaders: true, 
  legacyHeaders: false, 
  validate: {
    xForwardedForHeader: false,
    forwardedHeader: false,
  }
});
app.use("/api", apiLimiter);

// Parse JSON bodies
app.use(express.json());

// Health check (no DB)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API is running without DB" });
});

// Ensure DB connection before processing any API route
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Main API routes
app.use("/api/courses", coursesRouter);
app.use("/api/students", studentsRouter);
app.use("/api/auth", authRouter);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Express global error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error', stack: err.stack, name: err.name });
});

export default app;
