import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Middleware to protect routes with JWT
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, env.jwtSecret);
    
    // Add user id to request
    req.user = { id: decoded.id };
    
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
