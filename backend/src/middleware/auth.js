import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required. Please provide a valid JWT token.',
        error: 'NO_TOKEN'
      });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Token has expired. Please login again.',
            error: 'TOKEN_EXPIRED'
          });
        }
        return res.status(403).json({
          success: false,
          message: 'Invalid or malformed token.',
          error: 'INVALID_TOKEN'
        });
      }

      // Attach user to request
      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This action requires one of these roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

export const generateRefreshToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email
  };

  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET || 'refresh_secret', {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '30d'
  });
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || 'refresh_secret');
  } catch (error) {
    return null;
  }
};
