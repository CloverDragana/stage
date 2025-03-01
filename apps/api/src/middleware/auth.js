import { verifyToken as jwtVerify } from '@stage/auth';

// Express middleware for authentication
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorised access' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwtVerify(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};