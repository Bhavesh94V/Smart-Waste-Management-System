import PaymentService from '../services/PaymentService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export class PaymentController {
  generateInvoice = asyncHandler(async (req, res) => {
    const { pickupRequestId } = req.body;
    const payment = await PaymentService.generateInvoice(pickupRequestId, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Invoice generated successfully',
      data: payment
    });
  });

  initiatePayment = asyncHandler(async (req, res) => {
    const { paymentId, paymentMethod, transactionReference } = req.body;
    const payment = await PaymentService.initiatePayment(
      paymentId,
      paymentMethod,
      transactionReference
    );
    res.status(200).json({
      success: true,
      message: 'Payment initiated',
      data: payment
    });
  });

  completePayment = asyncHandler(async (req, res) => {
    const { paymentId, transactionId } = req.body;
    const payment = await PaymentService.completePayment(paymentId, transactionId);
    res.status(200).json({
      success: true,
      message: 'Payment completed successfully',
      data: payment
    });
  });

  failPayment = asyncHandler(async (req, res) => {
    const { paymentId, failureReason } = req.body;
    const payment = await PaymentService.failPayment(paymentId, failureReason);
    res.status(200).json({
      success: true,
      message: 'Payment marked as failed',
      data: payment
    });
  });

  refundPayment = asyncHandler(async (req, res) => {
    const { paymentId, refundReason } = req.body;
    const payment = await PaymentService.refundPayment(paymentId, refundReason, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Payment refunded successfully',
      data: payment
    });
  });

  getByPickupRequest = asyncHandler(async (req, res) => {
    const payment = await PaymentService.getPaymentByPickupRequest(req.params.pickupRequestId);
    res.status(200).json({
      success: true,
      data: payment
    });
  });

  list = asyncHandler(async (req, res) => {
    const { paymentStatus, dateFrom, dateTo } = req.query;
    const { page = 1, limit = 10 } = req.query;

    const filters = {
      citizenId: req.user.role === 'citizen' ? req.user.id : null,
      paymentStatus,
      dateFrom,
      dateTo
    };

    const options = {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const result = await PaymentService.listPayments(filters, options);
    res.status(200).json({
      success: true,
      data: result
    });
  });
}

export default new PaymentController();
