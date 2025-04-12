import express from 'express';
import multer from 'multer';
import { verifyToken } from '../middleware/auth.js';
import * as postController from '../controllers/postController.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/create-post', verifyToken, upload.single('file'), async (req, res) => {
    try{
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        console.log('Request body:', req.body);
        console.log('File:', req.file ? 'Exists' : 'Does not exist');

        const { userId, profileType, postText } = req.body;

        console.log('Extracted values:', { userId, profileType, postText });

        if (!userId || !profileType) {
            return res.status(400).json({ error: 'User Id and Profile Type are required' });
        }
        
        // const file = req.file;
        // const bytes = req.file.arrayBuffer();
        // const buffer = Buffer.from(bytes);
        let fileData = null;

        if (req.file) {
            fileData = {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                buffer: req.file.buffer
            };
        }
        
        const result = await postController.createPost(
            userId,
            profileType,
            postText,
            fileData
        );

        return res.status(201).json(result);
    } catch (error){
        console.error('Error creating post:', error);
        return res.status(500).json({ error: 'Unable to create a post' });
    }
});

export default router;