import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { hashPassword } from '@stage/auth';
import * as searchController from '../controllers/searchController.js';

const router = express.Router();

router.get('/search-user', verifyToken, async (req, res) => {
    try {
  
      const { query } = req.query;
  
      if (!query || query.trim().length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters' });
      }
  
      const result = await searchController.searchUsers(query);
      return res.status(200).json(result);
    } catch (error){
      console.error('Error searching users:', error);
  
      if (error.message === 'Search query must be greater than 2 characters long') {
        return res.status(400).json({ error: error.message });
      } 
      return res.status(500).json({ error: 'Error searching for users' });
    }
  });

export default router;