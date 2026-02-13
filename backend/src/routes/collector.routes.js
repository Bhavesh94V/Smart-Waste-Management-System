import express from 'express';
import PickupRequestController from '../controllers/PickupRequestController.js';
import { validate, pickupRequestValidations } from '../utils/validators.js';
import { authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Middleware: Only collectors can access these routes
router.use(authorizeRole('collector', 'admin'));

/**
 * @route   GET /api/collector/available-requests
 * @desc    Get list of available pickup requests for collection
 * @access  Private (Collector, Admin)
 */
router.get(
  '/available-requests',
  PickupRequestController.list
);

/**
 * @route   GET /api/collector/assigned-requests
 * @desc    Get list of assigned pickup requests for current collector
 * @access  Private (Collector, Admin)
 */
router.get(
  '/assigned-requests',
  (req, res, next) => {
    // Add assignedToMe flag to query
    req.query.assignedToMe = 'true';
    next();
  },
  PickupRequestController.list
);

/**
 * @route   GET /api/collector/request/:id
 * @desc    Get specific pickup request details
 * @access  Private (Collector, Admin)
 */
router.get(
  '/request/:id',
  PickupRequestController.getById
);

/**
 * @route   PUT /api/collector/request/:id/accept
 * @desc    Accept a pickup request assignment
 * @access  Private (Collector)
 */
router.put(
  '/request/:id/accept',
  (req, res, next) => {
    req.body.requestStatus = 'accepted';
    next();
  },
  PickupRequestController.updateStatus
);

/**
 * @route   PUT /api/collector/request/:id/reject
 * @desc    Reject a pickup request assignment
 * @access  Private (Collector)
 */
router.put(
  '/request/:id/reject',
  (req, res, next) => {
    req.body.requestStatus = 'rejected';
    next();
  },
  PickupRequestController.updateStatus
);

/**
 * @route   PUT /api/collector/request/:id/in-transit
 * @desc    Mark pickup as in-transit
 * @access  Private (Collector)
 */
router.put(
  '/request/:id/in-transit',
  (req, res, next) => {
    req.body.requestStatus = 'in_transit';
    next();
  },
  PickupRequestController.updateStatus
);

/**
 * @route   PUT /api/collector/request/:id/collected
 * @desc    Mark waste as collected
 * @access  Private (Collector)
 */
router.put(
  '/request/:id/collected',
  (req, res, next) => {
    req.body.requestStatus = 'collected';   // ✅ pehle status set
    next();
  },
  validate(pickupRequestValidations.updateStatus), // ✅ ab validation pass hogi
  PickupRequestController.updateStatus
);


export default router;
