import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { hashPassword } from '@stage/auth';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// Route that replaces register-user
router.post('/register', async (req, res) => {
  console.log("Registration data received:", req.body);

    try {
        const result = await userController.registerUser(req.body);
        return res.status(201).json({
          ...result,
          redirectUrl: "/profile"
        });
      } catch (error) {
        console.error('Error during registration:', error);
        
        // Handle specific errors
        if (error.message === 'All fields are required') {
          return res.status(400).json({ error: 'All fields are required register user file' });
        }
        if (error.message === 'Email already registered') {
          return res.status(400).json({ error: 'Email already registered' });
        }
        if (error.message === 'Username already taken') {
          return res.status(400).json({ error: 'Username already taken' });
        }
        
        // PostgreSQL errors
        if (error.code === '23505') {
          if (error.constraint === 'users_email_key') {
            return res.status(400).json({ error: 'Email already registered' });
          }
          if (error.constraint === 'users_username_key') {
            return res.status(400).json({ error: 'Username already taken' });
          }
        }
        
        return res.status(500).json({ error: 'Internal Server Error' });
      }
});

// Route to allow user to ypdate their  replaces update-profile
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

// router.get('/search-user', async (req, res) => {
//   try {

//     const { query } = req.query;

//     if (!query || query.trim().length < 2) {
//       return res.status(400).json({ error: 'Search query must be at least 2 characters' });
//     }

//     const result = await userController.searchUsers(query);
//     return res.status(200).json(result);
//   } catch (error){
//     console.error('Error searching users:', error);

//     if (error.message === 'Search query must be greater than 2 characters long') {
//       return res.status(400).json({ error: error.message });
//     } 
//     return res.status(500).json({ error: 'Error searching for users' });
//   }
// });


export default router;