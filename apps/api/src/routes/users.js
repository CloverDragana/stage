// const router = require('express').Router();
// const { db } = require('@stage/database');

const express = require('express');
const router = express.Router();
const { verifyToken } = require('@stage/auth');
const { hashPassword, comparePassword } = require('@stage/auth');
const bcyrpt = require('bcyrptjs');

// Route that replaces register-user
router.post('/register', async (req, res) => {
        try {
            const signUpInfo = await req.body;
    
            if (!signUpInfo.fullname || !signUpInfo.email || 
                !signUpInfo.username || !signUpInfo.password || !signUpInfo.profileType) {
                    return res.status(400).json({ 
                        error: 'All fields are required register user file' 
                    });
            }
    
            console.log('Registration info:', {
                ...signUpInfo,
                password: '[REDACTED]' // Don't log the password
            });
    
            const hashedPwd = await bcyrpt.hash(signUpInfo.password, 10);
            const pg = await db.connect();
    
            try {
                // First check if email or username already exists
                const existingUser = await pg.query(
                    'SELECT email, username FROM users WHERE email = $1 OR username = $2',
                    [signUpInfo.email, signUpInfo.username]
                );
    
                if (existingUser.rows.length > 0) {
                    const user = existingUser.rows[0];
                    if (user.email === signUpInfo.email) {
                        return res.status(400).json({ 
                            error: 'Email already registered' 
                        });
                    }
                    if (user.username === signUpInfo.username) {
                        return res.status(400).json({ 
                            error: 'Username already taken' 
                        });
                    }
                }
    
                const createUser = await pg.query(
                    `INSERT INTO users (
                        fullname, email, username, password, 
                        profile_type, personal_account, professional_account
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
                    RETURNING userid`,
                    [
                        signUpInfo.fullame,
                        signUpInfo.email,
                        signUpInfo.username,
                        hashedPwd,
                        signUpInfo.profileType,
                        signUpInfo.personal_account,
                        signUpInfo.professional_account
                    ]
                );
    
                const userId = createUser.rows[0].userid;
    
                await pg.query(
                    `INSERT INTO profiles (userid, profile_type)
                    VALUES ($1, $2)`,
                    [userId, signUpInfo.profileType.toLowerCase()]
                );
    
                return res.status(201).json({
                    message: 'User successfully registered',
                    userId: createUser.rows[0].userid,
                    redirectUrl: "/profile"
                });
            } finally {
                pg.release();
            }
        } catch (error) {
            console.error('Database query error:', error);
            
            // Better error handling
            if (error.code === '23505') { // PostgreSQL unique violation code
                if (error.constraint === 'users_email_key') {
                    return res.status(400).json({ 
                        error: 'Email already registered' 
                    });
                }
                if (error.constraint === 'users_username_key') {
                    return res.status(400).json({ 
                        error: 'Username already taken' 
                    });
            }
    
            return res.status(500).json({ 
                error: 'Internal Server Error' 
            });
        }
    }
});

// Route that replaces update-profile
router.put('/update-user', verifyToken, async (req, res) => {
        try {
            if(!req.user){
                return res.status(401).json({ message: 'Unauthorised access to page' });
            }

            const { userId, fullname, username, email, gender, dob } = await req.body;

            if (req.user.id !== userId) {
                return res.status(403).json({ error: 'Forbidden: Cannot update another user\'s profile' });
            }
    
            const pg = await db.connect();
    
            try {
                const updateUser = `
                UPDATE users
                SET fullname = $1,
                    username = $2,
                    email =$3,
                    gender = $4,
                    dob = $5
                WHERE userid = $6
                RETURNING *;
                `;
    
                const values = [fullname, username, email, gender, dob, userId];
    
                const dbResponse = await pg.query(updateUser, values);
    
                if (dbResponse.rowCount === 0){
                    return res.status(404).json({ error: 'User not found' });
                }

                const updatedUser = dbResponse.rows[0];
                return res.status(200).json({ 
                    message: 'Profile updated successfully!', 
                    user: updatedUser 
                });
    
                // const updatedUser = {
                //     ...session.user,
                //     fname,
                //     lname,
                //     username,
                //     email,
                //     gender,
                //     dob
                // };
                // return new Response(JSON.stringify({ message: 'Profile updated successfully!', user: updatedUser }), { status: 200 });
            } finally {
                pg.release(); 
            }
        } catch (error){
            console.error('Database query error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
});
router.delete('/delete-user', verifyToken, async (req, res) => {
    try {
        if(!req.user){
            return res.status(401).json({ message: 'Unauthorised access to page' });
        }

        const userId = req.user.id;
        const pg = await db.connect();

        try{
            const query = `
                DELETE FROM users
                WHERE userid = $1
                RETURNING *;
            `;
            const dbQuery = await pg.query(query, [userId]);

            if(dbQuery.rowCount === 0){
                return res.status(404).json({ message: 'User not found' });
            }

            return res.status(200).json({message: 'Account deleted successfully!'});
        } finally {
            pg.release();
        }
    } catch (error){
        console.error("Error deleting user", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
  });

module.exports = router;