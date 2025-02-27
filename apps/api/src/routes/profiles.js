const express = require('express');
const router = express.Router();
const { verifyToken } = require('@stage/auth');
const { db } = require('@stage/database');

// Route that replaces register-user
router.put('/update-profile', verifyToken, async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
    
            const {userId, profileType, creativeSlogan, bio } = await req.body;
    
            if (!userId || !profileType){
                return res.status(400).json({error: "UserId and Profile Type are required"});
            }

            if (req.user.id !== userId) {
                return res.status(403).json({ error: 'Forbidden: Cannot update another user\'s profile' });
            }
    
            const pg = await db.connect();
            try {
                const updateProfileData = await pg.query(
                    `UPDATE profiles SET
                        creative_slogan = $1,
                        bio = $2
                    WHERE userid = $3 and profile_type = $4
                    RETURNING *`,
                    [creativeSlogan, bio, userId, profileType]
                );
    
                if (updateProfileData.rows.length === 0){
                    return res.status(404).json({error: "Profile not found"});
                }
    
                return res.status(200).json({
                    message: "Profile data successfully updated!",
                    creativeSlogan,
                    bio
                });
    
            } finally {
                pg.release();
            }
        } catch (error) {
            console.log("Error updating profile data");
            return res.status(500).json({error: "Error updating profile data" });
        }
});

// Route that replaces update-profile
router.put('/update-profile-type', verifyToken, async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
    
            const { profileType } = await req.json();

            if (!profileType || !['personal', 'professional'].includes(profileType)) {
                return res.status(400).json({ error: 'Invalid profile type' });
            }
    
            const pg = await db.connect();
            try {
    
                const checkIsProfileTrue = await pg.query(
                    `SELECT personal_account, professional_account 
                    FROM users 
                    WHERE userid = $1;`,
                    [req.user.id]
                )
    
                const userProfile = checkIsProfileTrue.rows[0];
    
                if (!userProfile){
                    return res.status(404).json({error: "User not found"});
                }
    
                const hasProfile = profileType === 'personal' ? userProfile.personal_account : userProfile.professional_account;
    
                if (!hasProfile) {
                    console.log("User does not have profile type created:", profileType);
                    return res.status(200).json({ profileExists: false });
                }
    
                await pg.query(
                    'UPDATE users SET profile_type = $1 WHERE userid = $2',
                    [profileType, req.user.id]
                );
    
                return res.status(200).json({ 
                    message: 'Profile type updated successfully',
                    profileType,
                    profileExists: true 
                });
            } finally {
                pg.release();
            }
        } catch (error) {
            console.error('Error updating profile type:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
});

router.put('/create-second-profile', verifyToken, async (req, res) => {
        try {
            const { userId, profileType } = await req.body;

            if(!userId || !['personal', 'professional'].includes(profileType)){
                return res.status(400).json({error: 'User ID and Profile Type required to add additional profile'});
            }

            if (req.user.id !== userId) {
                return res.status(403).json({ error: "Forbidden: Cannot create a profile for another user" });
            }

            const pg = await db.connect();

            try{
                const checkUserId = userId;
                const checkProfileType = profileType;

                const secondProfileCheck = await pg.query(
                    `SELECT * FROM profiles WHERE userid = $1 AND profile_type = $2`,
                    [checkUserId, checkProfileType]    
                );

                if(secondProfileCheck.rows.length > 0){
                    return res.status(400).json({ error: 'This profile type already exists' });
                }

                await pg.query(
                    `INSERT INTO profiles (userid, profile_type)
                    VALUES ($1, $2)`,
                    [userId, profileType]
                ); 
                console.log (userId, profileType);

                const updateUserTable = profileType === 'personal' ? 'personal_account' : 'professional_account';

                await pg.query(
                    `UPDATE users SET ${updateUserTable} = TRUE WHERE userid = $1`,
                    [userId]
                );

                return res.status(201).json({ message: 'New Profile successfully added' });

            } finally {
                pg.release();
            }

        } catch (error) {
            console.error('Cannot create second profile type', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
});

router.get('/get-profile-content', async (req, res) => {
    try {

        const userId = req.query.id;
        const profileType = req.query.profileType;

            if(!userId || !['personal', 'professional'].includes(profileType)){
                return res.status(400).json({ error: 'User ID and Profile Type required to retrieve profile' });
            }

            const pg = await db.connect();

            try {
                const getProfileData = await pg.query(
                    'SELECT * FROM profiles WHERE userid = $1 and profile_type = $2',
                    [userId, profileType]
                );

                if (getProfileData.rows.length === 0){
                    return res.status(404).json({ error: "Profile data not found" });
                }

                const profileData = getProfileData.rows[0];

                return res.status(200).json({ 
                    message: 'Profile data retrieved successfully',
                    profilePicture: profileData.profile_picture,
                    creativeSlogan: profileData.creative_slogan,
                    bio: profileData.bio
                });
            } finally{
                pg.release();
            }
        } catch (error) {
            console.log("Failed to get data from profiles table")
            return res.status(500).json({ error: "Error getting data from database" });
        }
});

module.exports = router;