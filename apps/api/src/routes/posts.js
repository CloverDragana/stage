import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { verifyToken } from '../middleware/auth.js';
import * as postController from '../controllers/postController.js';
import * as profileModel from '../models/profiles.js';

const router = express.Router();

// reference for files uploads using multer middleware
//https://expressjs.com/en/resources/middleware/multer.html

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

// define path to the frontend directory where images are stored
const webPublicPath = path.join(__dirname, '../../../web/public');
// define path for within the frontend image folder for posts
const imageUploadDir = path.join(webPublicPath, 'uploads/posts');

// create directory if it doeesn't already exist
if (!fs.existsSync(imageUploadDir)) {
  fs.mkdirSync(imageUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    // set destination directory for uploaded post files
  destination: function(req, file, cb) {
    cb(null, imageUploadDir); 
  },
  filename: function(req, file, cb) { // function to determine the filename inside the folder
    // users id from the API request
    const userId = req.body.userId || req.body.id;
    // unique id using the timestamp and random number
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // filename construsted using the users id, unique id created above, and origina file extension
    // multer does not automatically append file extension  
    const fileName = `${userId}_${uniqueSuffix}${path.extname(file.originalname)}`;
    
    req.finalFileName = fileName;
    cb(null, fileName);
  }
});
// limit the configured multer files to 5MB
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/create-post', verifyToken, upload.single('file'), async (req, res) => {
    try{
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { userId, profileType, postText } = req.body;

        const postImage = req.file ? req.file.filename : null;

        if (!userId || !profileType) {
            return res.status(400).json({ error: 'User Id and Profile Type are required' });
        }
        
        const result = await postController.createPost(
            userId,
            profileType,
            postText,
            postImage
        );

        return res.status(201).json(result);
    } catch (error){
        console.error('Error creating post:', error);
        return res.status(500).json({ error: 'Unable to create a post' });
    }
});

router.get('/get-profile-posts', verifyToken, async (req, res) => {
    try{
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { userId, profileType } = req.query;
        
        const result = await postController.getProfilePosts(
            userId,
            profileType
        );

        return res.status(201).json({
            message: 'Profile posts fetched successfully',
            posts: result
        });
    } catch (error){
        console.error('Error getting profile posts:', error);
        return res.status(500).json({ error: 'Unable to get profile post' });
    }
});

// router.get('/get-homepage-posts', verifyToken, async (req, res) => {
//     try{
//         if (!req.user) {
//             return res.status(401).json({ error: 'Not authenticated' });
//         }

//         const { userId, profileType } = req.query;

//         console.log('Extracted values /get-homepage-posts:', { userId, profileType });

//         if (!userId || !profileType) {
//             return res.status(400).json({ error: 'User Id and Profile Type are required' });
//         }
        
//         const result = await postController.getHomePagePosts(
//             userId,
//             profileType,
//         );

//         return res.status(201).json({
//             message: 'Homepage posts fetched successfully',
//             posts: result
//         });
//     } catch (error){
//         console.error('Error getting homepage posts:', error);
//         return res.status(500).json({ error: 'Unable to get homepage posts' });
//     }
// });

router.get('/get-explore-posts', verifyToken, async (req, res) => {
    try{
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { userId, profileType } = req.query;
        
        if (!userId || !profileType) {
            return res.status(400).json({ error: 'User Id and Profile Type are required' });
        }

        const result = await postController.getExplorePosts(userId, profileType);

        return res.status(200).json({
            message: 'Post likes fetched successfully',
            posts: result
        });
    } catch (error){
        console.error('Error getting post likes:', error);
        return res.status(500).json({ error: 'Unable to get the posts likes' });
    }
});

router.delete('/delete-post', verifyToken, async (req, res) => {
    try {
            if (!req.user) {
              return res.status(401).json({ message: 'Unauthorised access to page' });
            }
            
            const result = await postController.deletePost(req.body.postId);
            return res.status(200).json(result);
          } catch (error) {
            console.error('Error deleting post:', error);     
            return res.status(500).json({ error: 'Internal server error' });
          }
});
router.get('/get-post-likes', verifyToken, async (req, res) => {
    try{
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { postId } = req.query;
        
        if (!postId) {
            return res.status(400).json({ error: 'Post ID is required' });
        }

        const likes = await postController.getPostLike(postId);

        return res.status(200).json({
            message: 'Post likes fetched successfully',
            likes: likes
        });
    } catch (error){
        console.error('Error getting post likes:', error);
        return res.status(500).json({ error: 'Unable to get the posts likes' });
    }
});

router.post('/like-posts', verifyToken, async (req, res) => {
    try{
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { postId, userId, profileType } = req.body;
        
        const result = await postController.createPostLike(
            postId,
            userId,
            profileType
        );

        return res.status(201).json({
            message: 'Post liked  successfully',
            likes: result
        });
    } catch (error){
        console.error('Error liking post:', error);
        return res.status(500).json({ error: 'Unable to like post' });
    }
});

router.post('/unlike-posts', verifyToken, async (req, res) => {
    try{
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { postId, userId, profileType } = req.body;

        if (!postId || !userId || !profileType) {
            return res.status(400).json({ error: 'Missing required field to like post' });
        }
        
        const result = await postController.deletePostLike(
            postId,
            userId,
            profileType
        );

        return res.status(201).json(result);
    } catch (error){
        console.error('Error liking post:', error);
        return res.status(500).json({ error: 'Unable to like post' });
    }
});

router.get('/get-comment-count', verifyToken, async(req, res) => {
    try{
        if(!req.user){
            return res.status(401).json({error: 'Not authenticated'})
        }

        const { postId } = req.query;
        
        if (!postId) {
            return res.status(400).json({ error: 'Post ID is required' });
        }

        const commentTotal = await postController.getCommentTotal(postId);

        return res.status(200).json(commentTotal);

        // return res.status(200).json({
        //     message: 'Post comment total fetched successfully',
        //     commentTotal: commentTotal
        // });

    }catch (error){
        console.error('Error fetching comment total:', error);
        return res.status(500).json({ error: 'Unable to fetch comment total' });
    }
});

router.get('/get-comments', verifyToken, async(req, res) => {
    try{
        if(!req.user){
            return res.status(401).json({error: 'Not authenticated'})
        }

        const { postId } = req.query;
        
        if (!postId) {
            return res.status(400).json({ error: 'Post ID is required' });
        }

        const comments = await postController.getComments(postId);

        return res.status(200).json({
            message: 'Post comments fetched successfully',
            comments: comments
        });

    }catch (error){
        console.error('Error fetching post comments:', error);
        return res.status(500).json({ error: 'Unable to fetch post comments' });
    }
});

router.post('/create-comment', verifyToken, async(req,res) => {
    try{

        if(!req.user){
            return res.status(401).json({error: 'Not authenticated'})
        }

        const { postId, userId, profileType, comment } = req.body;

        if (!userId || !profileType) {
            return res.status(400).json({ error: 'User ID and profileType is required' });
        }
        
        if (!postId || !comment) {
            return res.status(400).json({ error: 'Post ID and comment is required' });
        }

        const profileData = await profileModel.getProfileByUserIdAndType(userId, profileType);
        
        if (!profileData) {
        return res.status(400).json({ error: 'Profile not found' });
        }

        const newComment = await postController.createComment(postId, profileData.profileid, comment);

        return res.status(200).json({
            message:'Comment successfully created',
            comment: newComment
        })

    }catch (error){
        console.error("Error creating comment on post", error);
        return res.status(500).json({error: 'Unable to create comment on post'});
    }
});




export default router;


