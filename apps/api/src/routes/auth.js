// const express = require('express');
// const router = express.Router();
// const { db } = require('@stage/database');
// const { comparePassword } = require('@stage/auth');
// const jwt = require('jsonwebtoken');

import express from 'express';
import { db } from '@stage/database';
import { comparePassword } from '@stage/auth';
import jwt from 'jsonwebtoken';

const router = express.Router();

// This route is never accessed, NextAuth handles login details in order to create sessions and tokens for a user 
router.post('/user-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and Password required to log in' });
    }
    
    const pg = await db.connect();
    
    try {
      const dbQuery = await pg.query(
        `SELECT * FROM users WHERE username = $1`, [username]
      );
    
      if (dbQuery.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
          
      const user = dbQuery.rows[0];
      const passwordCorrect = await comparePassword(password, user.password);
    
      if (!passwordCorrect) {
        return res.status(401).json({ error: 'Password incorrect' });
      }
          
      const token = jwt.sign(
        { 
          id: user.userid,
          username: user.username,
          email: user.email 
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
      );
          
      const userResponse = {
        id: user.userid,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        gender: user.gender,
        dob: user.dob,
        profileType: user.profile_type,
        personal_account: user.personal_account,
        professional_account: user.professional_account
      };
          
      return res.status(200).json({
        message: 'Login successful',
        user: userResponse,
        token
      });
    } finally {
      pg.release();
    }
  } catch (error) {
    console.error('Database error', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
    
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
        
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
        
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
          
      // Optionally fetch fresh user data
      const pg = await db.connect();
      try {
        const result = await pg.query(
          `SELECT userid, fullname, username, email, gender, dob, profile_type, 
            personal_account, professional_account 
          FROM users WHERE userid = $1`,
          [decoded.id]
        );
            
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
            
        const user = result.rows[0];
            
        return res.status(200).json({
          valid: true,
          user: {
            id: user.userid,
            username: user.username,
            email: user.email,
            fullname: user.fullname,
            gender: user.gender,
            dob: user.dob,
            profileType: user.profile_type,
            personal_account: user.personal_account,
            professional_account: user.professional_account
          }
        });
      } finally {
        pg.release();
      }
    } catch (error) {
      // Token is invalid or expired
      return res.status(401).json({ valid: false, error: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Token verification error', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;