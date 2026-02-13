import express from 'express';
import PickupRequestController from '../controllers/PickupRequestController.js';
import PaymentController from '../controllers/PaymentController.js';
import BinController from '../controllers/BinController.js';
import ComplaintController from '../controllers/ComplaintController.js';
import { validate, pickupRequestValidations, paymentValidations } from '../utils/validators.js';
import { authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Middleware: Only citizens & admin can access these routes
router.use(authorizeRole('citizen', 'admin'));

/**
 * CREATE PICKUP REQUEST
 */
router.post(
  '/pickup-request',
  validate(pickupRequestValidations.create),
  PickupRequestController.create
);

/**
 * GET PICKUP REQUEST BY ID
 */
router.get(
  '/pickup-request/:id',
  PickupRequestController.getById
);

/**
 * LIST PICKUP REQUESTS
 */
router.get(
  '/pickup-requests',
  PickupRequestController.list
);

/**
 * UPDATE PICKUP STATUS
 */
router.put(
  '/pickup-request/:id/status',
  validate(pickupRequestValidations.updateStatus),
  PickupRequestController.updateStatus
);

/**
 * GET STATISTICS
 */
router.get(
  '/statistics',
  PickupRequestController.getStatistics
);

/**
 * GET NEARBY BINS
 */
router.get(
  '/bins',
  BinController.getNearbyBins
);

/**
 * GENERATE INVOICE
 */
router.post(
  '/invoice',
  PaymentController.generateInvoice
);

/**
 * LIST PAYMENTS
 */
router.get(
  '/payments',
  PaymentController.list
);

/**
 * GET PAYMENT BY PICKUP REQUEST
 */
router.get(
  '/payment/:pickupRequestId',
  PaymentController.getByPickupRequest
);

/**
 * INITIATE PAYMENT
 */
router.post(
  '/payment/initiate',
  PaymentController.initiatePayment
);

/**
 * COMPLETE PAYMENT
 */
router.post(
  '/payment/complete',
  PaymentController.completePayment
);

/**
 * SUBMIT COMPLAINT
 */
router.post(
  '/complaint',
  ComplaintController.create
);

/**
 * GET MY COMPLAINTS
 */
router.get(
  '/complaints',
  ComplaintController.getMyComplaints
);

export default router;
