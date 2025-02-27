const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorised access' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify using the same secret as NextAuth
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Same as NEXTAUTH_SECRET
    
    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};