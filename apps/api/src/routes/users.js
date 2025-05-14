import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { hashPassword } from '@stage/auth';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// Route that replaces register-user from pre-migration
// Handles account creations for users
router.post('/register', async (req, res) => {
    try {
        const result = await userController.registerUser(req.body);
        return res.status(201).json({
          ...result,
          redirectUrl: "/profile"
        });

      } catch (error) {
        console.error('Error during registration:', error);
        
        // Handle specific errors to show in the pop-up
        if (error.message === 'All fields are required') {
          return res.status(400).json({ error: 'All fields are required register user file' });
        }
        if (error.message === 'Email already registered') {
          return res.status(400).json({ error: 'Email already registered' });
        }
        if (error.message === 'Username already taken') {
          return res.status(400).json({ error: 'Username already taken' });
        }
        
        return res.status(500).json({ error: 'Internal Server Error' });
      }
});

// Route to allow user to update their non-profile specific information 
// replaces update-profile from pre-migrationu
router.put('/update-user', verifyToken, async (req, res) => {
    try {
        if (!req.user) {
          return res.status(401).json({ message: 'Unauthorised access to page' });
        }
        
        const result = await userController.updateUserDetails(
          req.body.userId,
          req.user.id,
          req.body
        );
        
        return res.status(200).json(result);
      } catch (error) {
        console.error('Error updating user:', error);
        
        if (error.message === 'Forbidden: Cannot update another user\'s profile') {
          return res.status(403).json({ error: error.message });
        }
        
        if (error.message === 'User not found') {
          return res.status(404).json({ error: 'User not found' });
        }
        
        return res.status(500).json({ error: 'Internal Server Error' });
      }
});

// Route to allow user to delete their account 
router.delete('/delete-user', verifyToken, async (req, res) => {
    try {
        if (!req.user) {
          return res.status(401).json({ message: 'Unauthorised access to page' });
        }
        
        const result = await userController.deleteUserAccount(req.user.id);
        return res.status(200).json(result);
      } catch (error) {
        console.error('Error deleting user:', error);
        
        if (error.message === 'User not found') {
          return res.status(404).json({ message: 'User not found' });
        }
        
        return res.status(500).json({ error: 'Internal server error' });
      }
  });

export default router;