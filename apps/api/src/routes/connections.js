import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import * as connectionController from '../controllers/connectionController.js';

const router = express.Router();

router.get('/check-follow-exists', verifyToken, async (req, res) => {

    try {
        const result = await connectionController.checkFollowExists(
          req.query.followerProfileId,
          req.query.followedProfileId
        );
        
        return res.status(200).json(result);
      } catch (error) {
        console.error('Failed to get data from follows table:', error);

        if (error.message.includes("Profile IDs required")) {
            return res.status(400).json({ error: error.message });
        }
        
        return res.status(500).json({ error: 'Error checking follow exists' });
      }
});

router.post('/follow', verifyToken, async (req, res) => {

    try {
        const result = await connectionController.followProfileType(
          req.body.followerProfileId,
          req.body.followedProfileId
        );
        
        return res.status(200).json(result);
      } catch (error) {
        console.error('Failed to follow:', error);

        if (error.message.includes("Profile IDs required")) {
            return res.status(400).json({ error: error.message });
        }
        
        return res.status(500).json({ error: 'Error following profile' });
      }
});

router.post('/unfollow', verifyToken, async (req, res) => {

    try {
        const result = await connectionController.unfollowProfileType(
          req.body.followerProfileId,
          req.body.followedProfileId
        );
        
        return res.status(200).json(result);
      } catch (error) {
        console.error('Failed to unfollow:', error);

        if (error.message.includes("Profile IDs required")) {
            return res.status(400).json({ error: error.message });
        }
        
        return res.status(500).json({ error: 'Error unfollowing profile' });
      }
});

router.get('/get-followers', verifyToken, async (req, res) => {

    try {
        const result = await connectionController.getFollowers(
          req.query.profileId
        );
        
        return res.status(200).json(result);
      } catch (error) {
        console.error('Failed to get Followers:', error);

        if (error.message.includes("Profile IDs required")) {
            return res.status(400).json({ error: error.message });
        }
        
        return res.status(500).json({ error: 'Error get Followers list' });
      }
});

router.get('/get-following', verifyToken, async (req, res) => {

    try {
        const result = await connectionController.getFollowing(
          req.query.profileId
        );
        
        return res.status(200).json(result);
      } catch (error) {
        console.error('Failed to get Following:', error);

        if (error.message.includes("Profile IDs required")) {
            return res.status(400).json({ error: error.message });
        }
        
        return res.status(500).json({ error: 'Error get Following list' });
      }
});

export default router;