// const express = require('express');
// const router = express.Router();
// const { verifyToken } = require('../middleware/auth');
// const { db } = require('@stage/database');
// const profileController = require('../controllers/profileController');

import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import * as profileController from '../controllers/profileController.js';

const router = express.Router();

// Route to update profile specific information in the profiles table 
router.put('/update-profile', verifyToken, async (req, res) => {
    try {
        if (!req.user) {
          return res.status(401).json({ error: 'Not authenticated' });
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

// Route to retrieve profile type specific information
router.get('/get-profile-content', async (req, res) => {
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

export default router;