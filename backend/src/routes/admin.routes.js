import express from 'express';
import PickupRequestController from '../controllers/PickupRequestController.js';
import PaymentController from '../controllers/PaymentController.js';
import BinController from '../controllers/BinController.js';
import ComplaintController from '../controllers/ComplaintController.js';
import { authorizeRole } from '../middleware/auth.js';
import { getWasteAnalytics, getUsers, updateUserStatus, getSettings, saveSettings } from '../controllers/adminController.js';

const router = express.Router();

// Middleware: Only admins can access these routes
router.use(authorizeRole('admin'));

/**
 * @route   GET /api/admin/pickup-requests
 * @desc    Get all pickup requests (admin view)
 * @access  Private (Admin)
 */
router.get(
  '/pickup-requests',
  PickupRequestController.list
);

/**
 * @route   GET /api/admin/pickup-request/:id
 * @desc    Get specific pickup request details
 * @access  Private (Admin)
 */
router.get(
  '/pickup-request/:id',
  PickupRequestController.getById
);

/**
 * @route   PUT /api/admin/pickup-request/:id/assign-collector
 * @desc    Assign a collector to a pickup request
 * @access  Private (Admin)
 */
router.put(
  '/pickup-request/:id/assign-collector',
  PickupRequestController.assignCollector
);

/**
 * @route   PUT /api/admin/pickup-request/:id/verify
 * @desc    Verify completed collection and mark as verified
 * @access  Private (Admin)
 */
router.put(
  '/pickup-request/:id/verify',
  (req, res, next) => {
    req.body.requestStatus = 'verified';
    next();
  },
  PickupRequestController.updateStatus
);

/**
 * @route   GET /api/admin/payments
 * @desc    Get all payments (admin view)
 * @access  Private (Admin)
 */
router.get(
  '/payments',
  PaymentController.list
);

/**
 * @route   POST /api/admin/payment/refund
 * @desc    Initiate refund for a payment
 * @access  Private (Admin)
 */
router.post(
  '/payment/refund',
  PaymentController.refundPayment
);

/**
 * @route   GET /api/admin/dashboard-stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.get(
  '/dashboard-stats',
  PickupRequestController.getStatistics
);

/**
 * @route   GET /api/admin/system-health
 * @desc    Get system health and status
 * @access  Private (Admin)
 */
router.get(
  '/system-health',
  async (req, res) => {
    try {
      const memUsage = process.memoryUsage();
      res.status(200).json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: {
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
            rss: Math.round(memUsage.rss / 1024 / 1024)
          },
          environment: process.env.NODE_ENV || 'development',
          nodeVersion: process.version
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Health check failed' });
    }
  }
);

router.get('/analytics/waste', getWasteAnalytics);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (with optional role filter)
 * @access  Private (Admin)
 */
router.get('/users', getUsers);

/**
 * @route   PUT /api/admin/users/:id/status
 * @desc    Update user status (active/inactive/suspended)
 * @access  Private (Admin)
 */
router.put('/users/:id/status', updateUserStatus);

/**
 * @route   GET /api/admin/bins
 * @desc    Get all bins
 * @access  Private (Admin)
 */
router.get('/bins', BinController.getNearbyBins);

/**
 * @route   POST /api/admin/bins
 * @desc    Create a new bin
 * @access  Private (Admin)
 */
router.post('/bins', BinController.createBin);

/**
 * @route   PUT /api/admin/bins/:id
 * @desc    Update a bin
 * @access  Private (Admin)
 */
router.put('/bins/:id', BinController.updateBin);

/**
 * @route   DELETE /api/admin/bins/:id
 * @desc    Delete a bin
 * @access  Private (Admin)
 */
router.delete('/bins/:id', BinController.deleteBin);

/**
 * @route   PUT /api/admin/bins/:id/fill-level
 * @desc    Update bin fill level (IoT simulation)
 * @access  Private (Admin)
 */
router.put('/bins/:id/fill-level', BinController.updateFillLevel);

/**
 * @route   PUT /api/admin/bins/:id/mark-collected
 * @desc    Mark bin as collected (reset fill level)
 * @access  Private (Admin)
 */
router.put('/bins/:id/mark-collected', BinController.markCollected);

/**
 * @route   GET /api/admin/complaints
 * @desc    Get all complaints
 * @access  Private (Admin)
 */
router.get('/complaints', ComplaintController.getAllComplaints);

/**
 * @route   PUT /api/admin/complaint/:id/status
 * @desc    Update complaint status
 * @access  Private (Admin)
 */
router.put('/complaint/:id/status', ComplaintController.updateStatus);

/**
 * @route   GET /api/admin/settings
 * @desc    Get all system settings
 * @access  Private (Admin)
 */
router.get('/settings', getSettings);

/**
 * @route   PUT /api/admin/settings
 * @desc    Save system settings (bulk upsert)
 * @access  Private (Admin)
 */
router.put('/settings', saveSettings);

export default router;
