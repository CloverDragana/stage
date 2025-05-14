import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { verifyToken } from '../middleware/auth.js';
import * as portfolioController from '../controllers/portfolioController.js';
import * as profileModel from '../models/profiles.js';

const router = express.Router();

// reference for files uploads using multer middleware
//https://expressjs.com/en/resources/middleware/multer.html

//documented
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

//documented
// define path to the frontend directory where images are stored
const webPublicPath = path.join(__dirname, '../../../web/public');
// define path for within the frontend image folder for portfolios
const portfolioImageUploadDir = path.join(webPublicPath, 'uploads/portfolio');

// create directory if it doeesn't already exist
//documented
if (!fs.existsSync(portfolioImageUploadDir)) {
  fs.mkdirSync(portfolioImageUploadDir, { recursive: true });
}
//documented
const storage = multer.diskStorage({
     // set destination directory for uploaded portfolio files
  destination: function(req, file, cb) {
    cb(null, portfolioImageUploadDir); 
  },
  filename: function(req, file, cb) { // function to determine the filename inside the folder
    // users id from the API request
    const userId = req.body.userId;
    // unique id using the timestamp and random number
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // filename construsted using the users id, unique id created above, and origina file extension
    // multer does not automatically append file extension 
    const fileName = `portfolio_${userId}_${uniqueSuffix}${path.extname(file.originalname)}`;
    
    if(!req.fileNames) {
        req.fileNames = [];
    };
    req.fileNames.push(fileName);
    cb(null, fileName);
  }
});

// limit the configured multer files to 5MB
//documented
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

//documented
router.post('/create-portfolio', verifyToken, upload.array('images', 10), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { userId, profileType, title, description, portfolioContent } = req.body;

        // validate the request body
        if (!userId || !profileType) {
            return res.status(400).json({ error: 'User Id and profile type are required' });
        }
        if (!title || !description) {
            return res.status(400).json({ error: 'Portfolio Name, Description, and content are required' });
        }
        if (req.files && req.files.length > 10) {
            return res.status(400).json({ error: 'You can upload a maximum of 10 images' });
        }

        let portfolioContentArray = [];
        try {
            if (portfolioContent) {
                // parse the JSON stringified portfolio content form data to the array
                portfolioContentArray = JSON.parse(portfolioContent);
            } else {
                return res.status(400).json({ error: 'Portfolio content is required' });
            }
        } catch (error) {
            // return error if issues with JSON parsing 
            console.error('Error parsing portfolioContent JSON:', error);
            return res.status(400).json({ error: 'Invalid portfolio content format' });
        }

        // check if files have been uploaded within the portfolio content
        if (req.files && req.files.length > 0) {
            //replace the parsed array with a new array using .map()
            portfolioContentArray = portfolioContentArray.map(item => {
                // find portfolio content that are images and have a valid image index
                if (item.type === 'image' && typeof item.imageOrder === 'number') {
                    // make sure the image indexing doesn't exceed the number of uploaded files
                    if (item.imageOrder < req.fileNames.length) {
                        return {
                            ...item, // preserve exisitng properties of the portfolio content object
                            //create a new property to associate the fileName with the image order index
                            fileName: req.fileNames[item.imageOrder] 
                        }; 
                    }
                }
                // return non-image portfolios items without changes
                return item;
            });
        }
        // return non-image portfolios items without changes // return non-image portfolios items without changes // return non-image portfolios items without changes

        const result = await portfolioController.createPortfolio(
            userId, 
            profileType, 
            title, 
            description,
            portfolioContentArray
        );
        

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error creating portfolio:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/get-portfolios', verifyToken, async(req, res) =>{
    try{
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { userId, profileType } = req.query;

        if (!userId || !profileType) {
            return res.status(400).json({ error: 'User Id and profile type are required' });
        }

        const result = await portfolioController.getPortfolios(
            userId, 
            profileType
        )

        return res.status(200).json(result);
    } catch(error){
        console.error('Error getting the profiles portfolio:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/get-explore-portfolios', verifyToken, async (req, res) => {
    try{
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { userId, profileType } = req.query;
        
        if (!userId || !profileType) {
            return res.status(400).json({ error: 'User Id and Profile Type are required' });
        }

        const result = await portfolioController.getExplorePortfolios(userId, profileType);

        return res.status(200).json({
            message: 'Portfolios likes fetched successfully',
            portfolios: result
        });
    } catch (error){
        console.error('Error getting Portfolio likes:', error);
        return res.status(500).json({ error: 'Unable to get the Portfolio likes' });
    }
});

router.get('/get-portfolio-likes', verifyToken, async (req, res) => {
    try{
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { portfolioId } = req.query;
        
        if (!portfolioId) {
            return res.status(400).json({ error: 'Portfolio ID is required' });
        }

        const likes = await portfolioController.getPortfolioLike(portfolioId);

        return res.status(200).json({
            message: 'Portfolio likes fetched successfully',
            likes: likes
        });
    } catch (error){
        console.error('Error getting Portfolio likes:', error);
        return res.status(500).json({ error: 'Unable to get the Portfolio likes' });
    }
});

router.post('/like-portfolios', verifyToken, async (req, res) => {
    try{
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { portfolioId, userId, profileType } = req.body;
        
        const result = await portfolioController.createPortfolioLike(
            portfolioId,
            userId,
            profileType
        );

        return res.status(201).json({
            message: 'Portfolio liked  successfully',
            likes: result
        });
    } catch (error){
        console.error('Error liking portfolio:', error);
        return res.status(500).json({ error: 'Unable to like portfolio' });
    }
});

router.post('/unlike-portfolios', verifyToken, async (req, res) => {
    try{
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { portfolioId, userId, profileType } = req.body;

        if (!portfolioId || !userId || !profileType) {
            return res.status(400).json({ error: 'Missing required fields to like portfolio' });
        }
        
        const result = await portfolioController.deletePortfolioLike(
            portfolioId,
            userId,
            profileType
        );

        return res.status(201).json(result);
    } catch (error){
        console.error('Error liking portfolio:', error);
        return res.status(500).json({ error: 'Unable to like portfolio' });
    }
});

router.get('/get-comment-count', verifyToken, async(req, res) => {
    try{
        if(!req.user){
            return res.status(401).json({error: 'Not authenticated'})
        }

        const { portfolioId } = req.query;
        
        if (!portfolioId) {
            return res.status(400).json({ error: 'Portfolio ID is required' });
        }

        const commentTotal = await portfolioController.getCommentTotal(portfolioId);

        return res.status(200).json(commentTotal);

        // return res.status(200).json({
        //     message: 'Portfolio comment total fetched successfully',
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

        const { portfolioId } = req.query;
        
        if (!portfolioId) {
            return res.status(400).json({ error: 'Portfolio ID is required' });
        }

        const comments = await portfolioController.getComments(portfolioId);

        return res.status(200).json({
            message: 'Portfolio comments fetched successfully',
            comments: comments
        });

    }catch (error){
        console.error('Error fetching portfolio comments:', error);
        return res.status(500).json({ error: 'Unable to fetch portfolio comments' });
    }
});

router.post('/create-comment', verifyToken, async(req,res) => {
    try{

        if(!req.user){
            return res.status(401).json({error: 'Not authenticated'})
        }

        const { portfolioId, userId, profileType, comment } = req.body;
        
        if (!portfolioId || !comment) {
            return res.status(400).json({ error: 'Portfolio ID and comment is required' });
        }

        if (!userId || !profileType) {
            return res.status(400).json({ error: 'User ID and profileType is required' });
        }

        const profileData = await profileModel.getProfileByUserIdAndType(userId, profileType);
                
        if (!profileData) {
            return res.status(400).json({ error: 'Profile not found' });
        }

        const newComment = await portfolioController.createComment(portfolioId, profileData.profileid, comment);

        return res.status(200).json({
            message:'Comment successfully created',
            comment: newComment
        })

    }catch (error){
        console.error("Error creating comment on portfolio", error);
        return res.status(500).json({error: 'Unable to create comment on portfolio'});
    }
});

export default router;