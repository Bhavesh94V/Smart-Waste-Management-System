import crypto from 'crypto'
import { Op } from 'sequelize'

import Payment from '../models/Payment.js'
import PickupRequest from '../models/PickupRequest.js'
import AuditLog from '../models/AuditLog.js'
import { AppError } from '../middleware/errorHandler.js'

export class PaymentService {
  async generateInvoice(pickupRequestId, citizenId) {
    const pickupRequest = await PickupRequest.findByPk(pickupRequestId)
    if (!pickupRequest) {
      throw new AppError('Pickup request not found', 404)
    }

    if (pickupRequest.citizenId !== citizenId) {
      throw new AppError('Unauthorized', 403)
    }

    const existingPayment = await Payment.findOne({
      where: { pickupRequestId },
      include: [{ model: PickupRequest, as: 'pickupRequest', attributes: ['id', 'wasteType', 'wasteQuantity'] }]
    })

    if (existingPayment) {
      // Return existing payment instead of throwing error
      return existingPayment
    }

    const serviceCharge = pickupRequest.estimatedServiceCharge || 100
    const tax = Math.round(serviceCharge * 0.18)
    const totalAmount = serviceCharge + tax

    const invoiceNumber = `INV-${Date.now()}-${crypto
      .randomUUID()
      .slice(0, 8)
      .toUpperCase()}`

    const payment = await Payment.create({
      pickupRequestId,
      citizenId,
      serviceCharge,
      tax,
      totalAmount,
      currency: 'INR',

      paymentMethod: null, // ✅ NOT DECIDED YET
      paymentStatus: 'pending',

      invoiceNumber,
      invoiceDate: new Date()
    })

    await this.logAudit({
      userId: citizenId,
      userRole: 'citizen',
      action: 'INVOICE_GENERATED',
      entityType: 'Payment',
      entityId: payment.id,
      status: 'success'
    })

    // Reload with pickup request association
    const fullPayment = await Payment.findByPk(payment.id, {
      include: [{ model: PickupRequest, as: 'pickupRequest', attributes: ['id', 'wasteType', 'wasteQuantity'] }]
    })

    return fullPayment
  }

  async initiatePayment(paymentId, paymentMethod, transactionReference = null) {
    const payment = await Payment.findByPk(paymentId)
    if (!payment) {
      throw new AppError('Payment not found', 404)
    }

    if (payment.paymentStatus !== 'pending') {
      throw new AppError('Payment already processed', 400)
    }

    payment.paymentMethod = paymentMethod
    payment.paymentStatus = 'initiated'
    payment.paymentGateway = this.getPaymentGateway(paymentMethod)

    if (transactionReference) {
      payment.paymentReference = transactionReference
    }

    await payment.save()

    await this.logAudit({
      userId: payment.citizenId,
      userRole: 'citizen',
      action: 'PAYMENT_INITIATED',
      entityType: 'Payment',
      entityId: payment.id,
      status: 'success'
    })

    return payment
  }

  async completePayment(paymentId, transactionId) {
    const payment = await Payment.findByPk(paymentId)
    if (!payment) {
      throw new AppError('Payment not found', 404)
    }

    payment.paymentStatus = 'completed'
    payment.transactionId = transactionId || crypto.randomUUID()
    payment.paidAt = new Date()
    await payment.save()

    const pickupRequest = await PickupRequest.findByPk(payment.pickupRequestId)
    if (pickupRequest && pickupRequest.requestStatus === 'verified') {
      pickupRequest.requestStatus = 'completed'
      await pickupRequest.save()
    }

    await this.logAudit({
      userId: payment.citizenId,
      userRole: 'citizen',
      action: 'PAYMENT_COMPLETED',
      entityType: 'Payment',
      entityId: payment.id,
      status: 'success'
    })

    return payment
  }

  async failPayment(paymentId, failureReason) {
    const payment = await Payment.findByPk(paymentId)
    if (!payment) {
      throw new AppError('Payment not found', 404)
    }

    payment.paymentStatus = 'failed'
    payment.failureReason = failureReason
    await payment.save()

    await this.logAudit({
      userId: payment.citizenId,
      userRole: 'citizen',
      action: 'PAYMENT_FAILED',
      entityType: 'Payment',
      entityId: payment.id,
      status: 'failure',
      errorMessage: failureReason
    })

    return payment
  }

  async refundPayment(paymentId, refundReason, adminId) {
    const payment = await Payment.findByPk(paymentId)
    if (!payment) {
      throw new AppError('Payment not found', 404)
    }

    if (payment.paymentStatus !== 'completed') {
      throw new AppError('Only completed payments can be refunded', 400)
    }

    payment.paymentStatus = 'refunded'
    payment.refundAmount = payment.totalAmount
    payment.refundedAt = new Date()
    payment.refundReason = refundReason
    await payment.save()

    await this.logAudit({
      userId: adminId,
      userRole: 'admin',
      action: 'PAYMENT_REFUNDED',
      entityType: 'Payment',
      entityId: payment.id,
      status: 'success'
    })

    return payment
  }

  async getPaymentByPickupRequest(pickupRequestId) {
    const payment = await Payment.findOne({
      where: { pickupRequestId },
      include: [{ model: PickupRequest, as: 'pickupRequest' }]
    })

    if (!payment) {
      throw new AppError('Payment not found', 404)
    }

    return payment
  }

  async listPayments(filters = {}, options = {}) {
    const { citizenId, paymentStatus, dateFrom, dateTo } = filters
    const { limit = 10, offset = 0 } = options

    const where = {}
    if (citizenId) where.citizenId = citizenId
    if (paymentStatus) where.paymentStatus = paymentStatus

    if (dateFrom || dateTo) {
      where.invoiceDate = {}
      if (dateFrom) where.invoiceDate[Op.gte] = new Date(dateFrom)
      if (dateTo) where.invoiceDate[Op.lte] = new Date(dateTo)
    }

    const { count, rows } = await Payment.findAndCountAll({
      where,
      include: [
        {
          model: PickupRequest,
          as: 'pickupRequest',
          attributes: ['id', 'wasteType', 'wasteQuantity']
        }
      ],
      limit,
      offset,
      order: [['invoiceDate', 'DESC']],
      distinct: true
    })

    return {
      total: count,
      page: Math.floor(offset / limit) + 1,
      pages: Math.ceil(count / limit),
      items: rows
    }
  }

  getPaymentGateway(paymentMethod) {
    const gatewayMap = {
      upi: 'Razorpay',
      credit_card: 'Stripe',
      debit_card: 'Razorpay',
      bank_transfer: 'NEFT',
      wallet: 'PayU',
      cash_on_collection: 'COD'
    }

    return gatewayMap[paymentMethod] || 'Direct'
  }

  async logAudit(auditData) {
    try {
      await AuditLog.create(auditData)
    } catch (error) {
      console.error('Audit logging error:', error)
    }
  }
}

export default new PaymentService()
