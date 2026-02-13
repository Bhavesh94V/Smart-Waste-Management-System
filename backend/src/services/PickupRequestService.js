import PickupRequest from '../models/PickupRequest.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import AuditLog from '../models/AuditLog.js';
import { AppError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';

export class PickupRequestService {
  async createPickupRequest(citizenId, requestData) {
    const {
      wasteType,
      wasteQuantity,
      description,
      pickupAddress,
      pickupLatitude,
      pickupLongitude,
      scheduledDate,
      preferredTimeSlot,
      priority = 'medium'
    } = requestData;

    // Create pickup request
    const pickupRequest = await PickupRequest.create({
      citizenId,
      wasteType,
      wasteQuantity,
      description,
      pickupAddress,
      pickupLatitude,
      pickupLongitude,
      scheduledDate,
      preferredTimeSlot,
      priority,
      requestStatus: 'pending'
    });

    // Calculate estimated service charge (simplified)
    const baseCharge = 50;
    const quantityCharge = wasteQuantity * 10;
    const priorityCharge = priority === 'urgent' ? 100 : priority === 'high' ? 50 : 0;
    pickupRequest.estimatedServiceCharge = baseCharge + quantityCharge + priorityCharge;
    await pickupRequest.save();

    // Log audit
    await this.logAudit({
      userId: citizenId,
      userRole: 'citizen',
      action: 'PICKUP_REQUEST_CREATED',
      entityType: 'PickupRequest',
      entityId: pickupRequest.id,
      status: 'success'
    });

    return pickupRequest;
  }

  async getPickupRequestById(requestId, userId = null) {
    const pickupRequest = await PickupRequest.findByPk(requestId, {
      include: [
        { model: User, as: 'citizen', attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'] },
        { model: User, as: 'collector', attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'] },
        { model: Payment, as: 'payment' }
      ]
    });

    if (!pickupRequest) {
      throw new AppError('Pickup request not found', 404);
    }

    // Check authorization
    if (userId && pickupRequest.citizenId !== userId && pickupRequest.collectorId !== userId) {
      const user = await User.findByPk(userId);
      if (user.role !== 'admin') {
        throw new AppError('Unauthorized access', 403);
      }
    }

    return pickupRequest;
  }

  async listPickupRequests(filters = {}, options = {}) {
    const { userId, userRole, status, wasteType, dateFrom, dateTo, assignedToMe } = filters;
    const { limit = 10, offset = 0, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    const where = {};

    if (status) where.requestStatus = status;
    if (wasteType) where.wasteType = wasteType;
    if (dateFrom || dateTo) {
      where.scheduledDate = {};
      if (dateFrom) where.scheduledDate[Op.gte] = new Date(dateFrom);
      if (dateTo) where.scheduledDate[Op.lte] = new Date(dateTo);
    }

    // Role-based filtering
    if (userRole === 'citizen') {
      where.citizenId = userId;
    } else if (userRole === 'collector') {
      if (assignedToMe) {
        where.collectorId = userId;
      } else {
        // Show available requests for collectors
        where[Op.or] = [
          { collectorId: null, requestStatus: 'pending' },
          { collectorId: userId }
        ];
      }
    }
    // Admin sees all

    const { count, rows } = await PickupRequest.findAndCountAll({
      where,
      include: [
        { model: User, as: 'citizen', attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'address'] },
        { model: User, as: 'collector', attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'] }
      ],
      limit,
      offset,
      order: [[sortBy, sortOrder]],
      distinct: true
    });

    return {
      total: count,
      page: Math.floor(offset / limit) + 1,
      pages: Math.ceil(count / limit),
      items: rows
    };
  }

  async updatePickupRequestStatus(requestId, newStatus, userId, notes = null) {
    const pickupRequest = await PickupRequest.findByPk(requestId);
    if (!pickupRequest) {
      throw new AppError('Pickup request not found', 404);
    }

    const oldStatus = pickupRequest.requestStatus;

    // Validate status transitions
    const validTransitions = {
      pending: ['assigned', 'accepted', 'cancelled'],
      assigned: ['accepted', 'in_transit', 'rejected', 'cancelled'],
      accepted: ['in_transit', 'cancelled'],
      in_transit: ['collected'],
      collected: ['verified'],
      verified: ['completed'],
      rejected: ['pending'],
      cancelled: []
    };

    if (!validTransitions[oldStatus].includes(newStatus)) {
      throw new AppError(`Cannot transition from ${oldStatus} to ${newStatus}`, 400);
    }

    // Update status
    pickupRequest.requestStatus = newStatus;

    // Update timestamps based on status
    switch (newStatus) {
      case 'accepted':
        pickupRequest.collectorAcceptanceTime = new Date();
        break;
      case 'collected':
        pickupRequest.collectionTime = new Date();
        break;
      case 'verified':
        pickupRequest.verificationTime = new Date();
        pickupRequest.verificationNotes = notes;
        break;
    }

    if (newStatus === 'cancelled') {
      pickupRequest.cancelledBy = 'system'; // Can be updated to user type
      pickupRequest.cancellationReason = notes;
    }

    await pickupRequest.save();

    // Auto-generate payment invoice when waste is collected or verified
    if (newStatus === 'collected' || newStatus === 'verified') {
      try {
        const existingPayment = await Payment.findOne({
          where: { pickupRequestId: requestId }
        });

        if (!existingPayment) {
          const crypto = await import('crypto');
          const serviceCharge = pickupRequest.estimatedServiceCharge || 100;
          const tax = Math.round(serviceCharge * 0.18);
          const totalAmount = serviceCharge + tax;
          const invoiceNumber = `INV-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

          await Payment.create({
            pickupRequestId: requestId,
            citizenId: pickupRequest.citizenId,
            serviceCharge,
            tax,
            totalAmount,
            currency: 'INR',
            paymentMethod: null,
            paymentStatus: 'pending',
            invoiceNumber,
            invoiceDate: new Date()
          });
        }
      } catch (paymentError) {
        console.error('Auto payment generation error:', paymentError);
      }
    }

    // Log audit
    await this.logAudit({
      userId,
      userRole: 'admin', // Or derive from user
      action: 'PICKUP_REQUEST_STATUS_UPDATED',
      entityType: 'PickupRequest',
      entityId: requestId,
      changes: { status: { old: oldStatus, new: newStatus } },
      status: 'success'
    });

    return pickupRequest;
  }

  async assignCollectorToRequest(requestId, collectorId, adminId) {
    const pickupRequest = await PickupRequest.findByPk(requestId);
    if (!pickupRequest) {
      throw new AppError('Pickup request not found', 404);
    }

    const collector = await User.findByPk(collectorId);
    if (!collector || collector.role !== 'collector') {
      throw new AppError('Invalid collector', 400);
    }

    const oldCollectorId = pickupRequest.collectorId;

    pickupRequest.collectorId = collectorId;
    pickupRequest.requestStatus = 'assigned';
    await pickupRequest.save();

    await this.logAudit({
      userId: adminId,
      userRole: 'admin',
      action: 'COLLECTOR_ASSIGNED',
      entityType: 'PickupRequest',
      entityId: requestId,
      changes: { collectorId: { old: oldCollectorId, new: collectorId } },
      status: 'success'
    });

    return pickupRequest;
  }

  async getPickupStatistics(userId = null, filters = {}) {
    const where = {};
    if (userId) where.citizenId = userId;

    const stats = await PickupRequest.findAll({
      where,
      attributes: [
        'requestStatus',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['requestStatus'],
      raw: true
    });

    const statistics = {
      total: 0,
      pending: 0,
      assigned: 0,
      accepted: 0,
      in_transit: 0,
      collected: 0,
      verified: 0,
      completed: 0,
      cancelled: 0
    };

    stats.forEach(stat => {
      statistics[stat.requestStatus] = parseInt(stat.count) || 0;
      statistics.total += parseInt(stat.count) || 0;
    });

    return statistics;
  }

  async logAudit(auditData) {
    try {
      await AuditLog.create(auditData);
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }
}

export default new PickupRequestService();
