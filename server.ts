import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import helmet from "helmet";
import apiApp from "./api/index.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust reverse proxy
  app.set("trust proxy", 1);

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: false, // Vite uses inline scripts in dev
  }));

  // Mount backend API routes first
  app.use(apiApp);

  // Vite middleware for development or Static Serving for production
  if (process.env.NODE_ENV !== "production") {
    // In dev, use Vite's middleware to serve the frontend
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the dist folder
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
