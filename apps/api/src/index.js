// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const { verifyToken } = require('./middleware/auth');

import express from 'express';
import cors from 'cors';
import { db } from '@stage/database';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import profilesRoutes from './routes/profiles.js';
import searchRoutes from './routes/search.js';
import connectionsRouter from './routes/connections.js';
import { verifyToken } from './middleware/auth.js';
import dotenv from 'dotenv';

dotenv.config();

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

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});