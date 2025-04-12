import express from 'express';
import cors from 'cors';
import { db } from '@stage/database';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import profilesRoutes from './routes/profiles.js';
import searchRoutes from './routes/search.js';
import connectionsRouter from './routes/connections.js';
import postRouter from './routes/posts.js';
import { verifyToken } from './middleware/auth.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webPublicPath = path.join(__dirname, '../../../web/public');
const imageUploadDir = path.join(webPublicPath, 'uploads/profile');

const app = express();
const PORT = process.env.PORT || 3001;

const testConnection = async () => {
    try {
      const client = await db.connect();
      console.log('Successfully connected to PostgreSQL database');
      client.release();
      return true;
    } catch (error) {
      console.error('Failed to connect to PostgreSQL database:', error);
      return false;
    }
  };
  
  // Run connection test
  (async () => {
    await testConnection();
  })();

  console.log("API server is starting...");
console.log("Current directory:", __dirname);
console.log("Web public path:", webPublicPath);
console.log("Image upload directory:", imageUploadDir);

// Check if directories exist
console.log("Web public path exists:", fs.existsSync(webPublicPath));
console.log("Image upload directory exists:", fs.existsSync(imageUploadDir));

// List files in image upload directory if it exists
if (fs.existsSync(imageUploadDir)) {
  const files = fs.readdirSync(imageUploadDir);
  console.log("Files in image upload directory:", files);
} else {
  console.log("Image upload directory does not exist, creating it");
  fs.mkdirSync(imageUploadDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

console.log("Setting up static file serving from:", webPublicPath);
app.use('/uploads', express.static(path.join(webPublicPath, 'uploads')));

// Auth Routes
// app.use('/api/users/register', express.json());
// app.use('/api/users/login', express.json());

// // Protected Routes
// app.use('/api/users', verifyToken);
// app.use('/api/profiles', verifyToken);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/connections', connectionsRouter);
app.use('/api/posts', postRouter);

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});