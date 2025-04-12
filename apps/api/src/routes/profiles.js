// const express = require('express');
// const router = express.Router();
// const { verifyToken } = require('../middleware/auth');
// const { db } = require('@stage/database');
// const profileController = require('../controllers/profileController');

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { verifyToken } from '../middleware/auth.js';
import * as profileController from '../controllers/profileController.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

const webPublicPath = path.join(__dirname, '../../../web/public');
const imageUploadDir = path.join(webPublicPath, 'uploads/profile');


if (!fs.existsSync(imageUploadDir)) {
  fs.mkdirSync(imageUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, imageUploadDir); 
  },
  filename: function(req, file, cb) {
    
    const userId = req.body.userId || req.body.id;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = `${userId}_${uniqueSuffix}${path.extname(file.originalname)}`;
    
    req.finalFileName = fileName;
    cb(null, fileName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Route to retrieve profile type specific information
router.get('/get-profile-content', verifyToken, async (req, res) => {

  try {
      const result = await profileController.getProfileContent(
        req.query.id,
        req.query.profileType
      );
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Failed to get data from profiles table:', error);
      
      if (error.message === 'User ID and Profile Type required to retrieve profile') {
        return res.status(400).json({ error: error.message });
      }
      
      if (error.message === 'Profile data not found') {
        return res.status(404).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'Error getting data from database' });
    }
});

router.get('/get-profile-id', verifyToken, async (req, res) => {

try {
    const result = await profileController.getProfileId(
      req.query.userId,
      req.query.profileType
    );
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Failed to get data from profiles table:', error);
    
    return res.status(500).json({ error: 'Error getting data from database' });
  }
});

router.get('/get-profile-picture', verifyToken, async (req, res) => {
  console.log('/get-profile-picture route: Profile picture get request:', { 
    body: req.body,
    file: req.file ? {
      filename: req.file.filename,
      path: req.file.path,
      destination: req.file.destination
    } : 'No file',
    user: req.user.id
  });

try {
    const result = await profileController.getProfilePicture(
      req.query.userId,
      req.query.profileType
    );
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Failed to get data from profiles table:', error);
    
    return res.status(500).json({ error: 'Error getting data from database' });
  }
});

router.get('/get-banner-image', verifyToken, async (req, res) => {

try {
    const result = await profileController.getBannerImage(
      req.query.userId,
      req.query.profileType
    );
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Failed to get data from profiles table:', error);
    
    return res.status(500).json({ error: 'Error getting data from database' });
  }
});

router.get('/get-star-work', verifyToken, async (req, res) => {

try {
    const result = await profileController.getStarWork(
      req.query.userId,
      req.query.profileType
    );
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Failed to get data from profiles table:', error);
    
    return res.status(500).json({ error: 'Error getting data from database' });
  }
});

// Route to update profile type that the users is trying to access
router.put('/update-profile-type', verifyToken, async (req, res) => {
  try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      const result = await profileController.updateProfileType(
        req.user.id,
        req.body.profileType
      );
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error updating profile type:', error);
      
      if (error.message === 'Invalid profile type') {
        return res.status(400).json({ error: error.message });
      }
      
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to update profile specific information in the profiles table 
router.put('/update-profile', verifyToken, async (req, res) => {
    try {
        if (!req.user) {
          return res.status(401).json({ error: 'Not authenticated' });
        }

        if (!req.body.userId || !req.body.profileType) {
          return res.status(400).json({ error: 'UserId and Profile Type are required' });
        }
        
        const result = await profileController.updateProfileData(
          req.body.userId,
          req.user.id,
          req.body
        );
        
        return res.status(200).json(result);
      } catch (error) {
        console.error('Error updating profile data:', error);
        
        if (error.message === 'UserId and Profile Type are required') {
          return res.status(400).json({ error: error.message });
        }
        
        if (error.message === 'Forbidden: Cannot update another user\'s profile') {
          return res.status(403).json({ error: error.message });
        }
        
        if (error.message === 'Profile not found') {
          return res.status(404).json({ error: error.message });
        }
        
        return res.status(500).json({ error: 'Error updating profile data' });
      }
});

router.put('/update-profile-picture', verifyToken, upload.single('file'), async (req, res) => {
  try{
    console.log('Profile picture upload request:', { 
      body: req.body,
      file: req.file ? {
        filename: req.file.filename,
        path: req.file.path,
        destination: req.file.destination
      } : 'No file',
      user: req.user.id
    });
    if(!req.user){
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Profile picture upload request:', { 
      body: req.body,
      file: req.file ? req.file.filename : 'No file',
      user: req.user.id
    });

    if (!req.body.userId || !req.body.profileType) {
      return res.status(400).json({ error: 'UserId and Profile Type are required' });
    }

    // const profilePicturePath = `/uploads/profile/${req.file.filename}`;
    console.log("file name", req.file.filename);

    const result = await profileController.updateProfilePicture(
      req.body.userId,
      req.user.id,
      req.body.profileType,
      req.file.filename
    );

    return res.status(200).json(result);

  } catch (error){
    console.error('Error updating profile picture:', error);
    return res.status(500).json({ error: 'Unable to update profile picture' });
  }
});

router.put('/update-banner-image', verifyToken, upload.single('file'), async (req, res) => {
  try{
    if(!req.user){
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Profile picture upload request:', { 
      body: req.body,
      file: req.file ? req.file.filename : 'No file',
      user: req.user.id
    });

    if (!req.body.userId || !req.body.profileType) {
      return res.status(400).json({ error: 'UserId and Profile Type are required' });
    }

    // const profilePicturePath = `/uploads/profile/${req.file.filename}`;
    console.log("file name", req.file.filename);

    const result = await profileController.updateBannerImage(
      req.body.userId,
      req.user.id,
      req.body.profileType,
      req.file.filename
    );

    return res.status(200).json(result);

  } catch (error){
    console.error('Error updating profile picture:', error);
    return res.status(500).json({ error: 'Unable to update profile picture' });
  }
});

router.put('/update-star-work-image', verifyToken, upload.single('file'), async (req, res) => {
  try{
    console.log("Received file:", req.file.originalname);
    console.log("Saving to:", req.file.path);
    if(!req.user){
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Profile picture upload request:', { 
      body: req.body,
      file: req.file ? req.file.filename : 'No file',
      user: req.user.id,
      imageIndex: req.body.imageIndex
    });

    if (!req.body.userId || !req.body.profileType || req.body.imageIndex === undefined) {
      return res.status(400).json({ error: 'UserId, Profile Type, and Star Work Index are required' });
    }

    // const profilePicturePath = `/uploads/profile/${req.file.filename}`;
    console.log("file name", req.file.filename);

    const imageIndex = parseInt(req.body.imageIndex, 10);
    console.log("Received imageIndex:", imageIndex, typeof imageIndex);

    const result = await profileController.updateStarWork(
      req.body.userId,
      req.user.id,
      req.body.profileType,
      req.file.filename,
      imageIndex
    );

    return res.status(200).json(result);

  } catch (error){
    console.error('Error updating profile picture:', error);
    return res.status(500).json({ error: 'Unable to update profile picture' });
  }
});

// Route to allow user to create a second profile
router.put('/create-second-profile', verifyToken, async (req, res) => {
    try {
        if (!req.user) {
          return res.status(401).json({ error: 'Not authenticated' });
        }
        
        const result = await profileController.createSecondProfile(
          req.body.userId,
          req.user.id,
          req.body.profileType
        );
        
        return res.status(201).json(result);
      } catch (error) {
        console.error('Cannot create second profile type:', error);
        
        if (error.message === 'User ID and Profile Type required to add additional profile') {
          return res.status(400).json({ error: error.message });
        }
        
        if (error.message === 'This profile type already exists') {
          return res.status(400).json({ error: error.message });
        }
        
        if (error.message === 'Forbidden: Cannot create a profile for another user') {
          return res.status(403).json({ error: error.message });
        }
        
        return res.status(500).json({ error: 'Internal Server Error' });
      }
});

// Add this to your routes/profiles.js
router.get('/debug-files', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const { fileURLToPath } = require('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const webPublicPath = path.join(__dirname, '../../../web/public');
    const imageUploadDir = path.join(webPublicPath, 'uploads/profile');
    
    // Check if directory exists
    const directoryExists = fs.existsSync(imageUploadDir);
    
    // List files if directory exists
    let files = [];
    if (directoryExists) {
      files = fs.readdirSync(imageUploadDir);
    }
    
    return res.status(200).json({
      directoryPath: imageUploadDir,
      directoryExists,
      files
    });
  } catch (error) {
    console.error('Error checking files:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
export default router;