// import { verifyToken, generateToken } from './jwt';
// import { authMiddleware } from './middleware';
// import { hashPassword, comparePassword } from './passwords';

const { verifyToken, generateToken } = require('./jwt');
const { authMiddleware } = require('./middleware');
const { hashPassword, comparePassword } = require('./passwords');

module.exports = {
    generateToken,
    verifyToken,
    authMiddleware,
    hashPassword,
    comparePassword
};