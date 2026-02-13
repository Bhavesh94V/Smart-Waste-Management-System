import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { validate, authValidations } from '../utils/validators.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (citizen, collector, or admin)
 * @access  Public
 */
router.post(
  '/register',
  validate(authValidations.register),
  AuthController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user with email and password
 * @access  Public
 */
router.post(
  '/login',
  validate(authValidations.login),
  AuthController.login
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post(
  '/logout',
  authenticateToken,
  AuthController.logout
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/profile',
  authenticateToken,
  AuthController.getProfile
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile', 
  authenticateToken,
  AuthController.updateProfile
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post(
  '/change-password',
  authenticateToken,
  AuthController.changePassword
);

export default router;
