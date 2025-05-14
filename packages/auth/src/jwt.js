const jwt = require('jsonwebtoken');

exports.generateToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, process.env.NEXTAUTH_SECRET, { expiresIn });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.NEXTAUTH_SECRET);
};