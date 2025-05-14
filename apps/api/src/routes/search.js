import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { hashPassword } from '@stage/auth';
import * as searchController from '../controllers/searchController.js';

const router = express.Router();

router.get('/search-user', verifyToken, async (req, res) => {
    try {
      // retrieve the search query from the requests query parameter
      const { query } = req.query;
  
      // return error meesgae if query doesn't exist or if less than 2 characters long
      if (!query || query.trim().length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters in length' });
      }
  
      const result = await searchController.searchUsers(query);
      // return successful result
      return res.status(200).json(result);
    } catch (error){
      console.error('Error searching users:', error);
  
      if (error.message === 'Search query must be at least 2 characters in length') {
        return res.status(400).json({ error: error.message });
      } 
      return res.status(500).json({ error: 'Error searching for users' });
    }
  });

// router.get('/search-homefeed'), verifyToken, async(req, res) => {
//    try {
//         const result = await searchController.getHomePageContent(
//           req.query.id,
//           req.query.profileType
//         );
        
//         return res.status(200).json(result);
//       } catch (error) {
//         console.error('Failed to get data from posts and portfolios', error);
        
//         if (error.message === 'User ID and Profile Type required to retrieve homepage feed') {
//           return res.status(400).json({ error: error.message });
//         }
        
//         // if (error.message === 'Profile data not found') {
//         //   return res.status(404).json({ error: error.message });
//         // }
        
//         return res.status(500).json({ error: 'Error getting data from database' });
//       }
// };

export default router;