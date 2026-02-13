import PickupRequestService from '../services/PickupRequestService.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import PickupRequest from '../models/PickupRequest.js'
import User from '../models/User.js'
import Bin from '../models/Bin.js'
import Payment from '../models/Payment.js'
import sequelize from '../config/database.js'
import { Op, fn, col, literal } from 'sequelize'

export class PickupRequestController {
  create = asyncHandler(async (req, res) => {
    const pickupRequest = await PickupRequestService.createPickupRequest(
      req.user.id,
      req.body
    )
    res.status(201).json({
      success: true,
      message: 'Pickup request created successfully',
      data: pickupRequest
    })
  })

  getById = asyncHandler(async (req, res) => {
    const pickupRequest = await PickupRequestService.getPickupRequestById(
      req.params.id,
      req.user.id
    )
    res.status(200).json({
      success: true,
      data: pickupRequest
    })
  })

  list = asyncHandler(async (req, res) => {
    const { status, wasteType, dateFrom, dateTo, assignedToMe } = req.query
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query

    const filters = {
      userId: req.user.id,
      userRole: req.user.role,
      status,
      wasteType,
      dateFrom,
      dateTo,
      assignedToMe: assignedToMe === 'true'
    }

    const options = {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      sortBy,
      sortOrder
    }

    const result = await PickupRequestService.listPickupRequests(
      filters,
      options
    )
    res.status(200).json({
      success: true,
      data: result
    })
  })

  updateStatus = asyncHandler(async (req, res) => {
    const { requestStatus, notes } = req.body
    const pickupRequest = await PickupRequestService.updatePickupRequestStatus(
      req.params.id,
      requestStatus,
      req.user.id,
      notes
    )
    res.status(200).json({
      success: true,
      message: 'Pickup request status updated',
      data: pickupRequest
    })
  })

  markCollected = asyncHandler(async (req, res) => {
    const pickupRequest = await PickupRequestService.updatePickupRequestStatus(
      req.params.id,
      'collected', // ✅ HARD-CODED STATUS
      req.user.id,
      req.body.notes
    )

    // Save image proof
    pickupRequest.imageProof = req.body.imageProof || []
    await pickupRequest.save()

    res.status(200).json({
      success: true,
      message: 'Waste collected successfully',
      data: pickupRequest
    })
  })

  assignCollector = asyncHandler(async (req, res) => {
    const { collectorId } = req.body
    const pickupRequest = await PickupRequestService.assignCollectorToRequest(
      req.params.id,
      collectorId,
      req.user.id
    )
    res.status(200).json({
      success: true,
      message: 'Collector assigned successfully',
      data: pickupRequest
    })
  })

  getStatistics = asyncHandler(async (req, res) => {
    // Real DB queries for dashboard stats
    const [totalUsers, activeCollectors, pendingRequests, totalRequests, completedRequests] = await Promise.all([
      User.count(),
      User.count({ where: { role: 'collector', status: 'active' } }),
      PickupRequest.count({ where: { requestStatus: 'pending' } }),
      PickupRequest.count(),
      PickupRequest.count({ where: { requestStatus: { [Op.in]: ['completed', 'verified', 'collected'] } } })
    ]);

    const recycledPercentage = totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0;

    // Calculate user growth trend (compare last 30 days vs prior 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [recentUsers, priorUsers] = await Promise.all([
      User.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
      User.count({ where: { createdAt: { [Op.gte]: sixtyDaysAgo, [Op.lt]: thirtyDaysAgo } } })
    ]);

    const userTrend = priorUsers > 0 ? Math.round(((recentUsers - priorUsers) / priorUsers) * 100) : (recentUsers > 0 ? 100 : 0);

    res.status(200).json({
      totalUsers,
      activeCollectors,
      pendingRequests,
      recycledPercentage,
      userTrend: {
        value: Math.abs(userTrend),
        isPositive: userTrend >= 0
      }
    })
  })

  getWasteAnalytics = asyncHandler(async (req, res) => {
    // Real waste type distribution from DB
    const wasteByType = await PickupRequest.findAll({
      attributes: [
        'wasteType',
        [fn('COUNT', col('id')), 'count'],
        [fn('COALESCE', fn('SUM', col('waste_quantity')), 0), 'totalWeight']
      ],
      where: { requestStatus: { [Op.notIn]: ['cancelled'] } },
      group: ['wasteType'],
      raw: true
    });

    // Map waste types to dry/wet/hazardous categories
    let dryWaste = 0, wetWaste = 0, hazardousWaste = 0, totalWeight = 0;
    wasteByType.forEach(item => {
      const count = parseInt(item.count) || 0;
      const weight = parseFloat(item.totalWeight) || 0;
      totalWeight += weight;
      if (['recyclable', 'e-waste', 'other'].includes(item.wasteType)) {
        dryWaste += count;
      } else if (['biodegradable', 'mixed'].includes(item.wasteType)) {
        wetWaste += count;
      } else if (item.wasteType === 'hazardous') {
        hazardousWaste += count;
      }
    });

    // Total collections and other stats
    const [totalCollections, fullBins, activeCitizens] = await Promise.all([
      PickupRequest.count({ where: { requestStatus: { [Op.in]: ['collected', 'verified', 'completed'] } } }),
      Bin.count({ where: { status: 'full' } }),
      User.count({ where: { role: 'citizen', status: 'active' } })
    ]);

    // Weekly data - last 7 days grouped by day
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyRaw = await PickupRequest.findAll({
      attributes: [
        [fn('TO_CHAR', col('scheduled_date'), 'Dy'), 'day'],
        [fn('EXTRACT', literal("DOW FROM scheduled_date")), 'dayNum'],
        'wasteType',
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        scheduledDate: { [Op.gte]: sevenDaysAgo },
        requestStatus: { [Op.notIn]: ['cancelled'] }
      },
      group: [literal("TO_CHAR(scheduled_date, 'Dy')"), literal("EXTRACT(DOW FROM scheduled_date)"), 'wasteType'],
      order: [[literal("EXTRACT(DOW FROM scheduled_date)"), 'ASC']],
      raw: true
    });

    // Transform weekly data
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyMap = {};
    dayNames.forEach(d => { weeklyMap[d] = { day: d, dry: 0, wet: 0, hazardous: 0 }; });

    weeklyRaw.forEach(row => {
      const dayIdx = parseInt(row.dayNum);
      const dayName = dayNames[dayIdx] || row.day?.trim();
      if (!weeklyMap[dayName]) return;
      const count = parseInt(row.count) || 0;
      if (['recyclable', 'e-waste', 'other'].includes(row.wasteType)) {
        weeklyMap[dayName].dry += count;
      } else if (['biodegradable', 'mixed'].includes(row.wasteType)) {
        weeklyMap[dayName].wet += count;
      } else if (row.wasteType === 'hazardous') {
        weeklyMap[dayName].hazardous += count;
      }
    });

    const weeklyData = dayNames.map(d => weeklyMap[d]);

    // Monthly data - last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRaw = await PickupRequest.findAll({
      attributes: [
        [fn('TO_CHAR', col('scheduled_date'), 'Mon'), 'month'],
        [fn('EXTRACT', literal("MONTH FROM scheduled_date")), 'monthNum'],
        [fn('COUNT', col('id')), 'collections'],
        [fn('COUNT', literal("CASE WHEN request_status IN ('collected','verified','completed') THEN 1 END")), 'recycled']
      ],
      where: {
        scheduledDate: { [Op.gte]: sixMonthsAgo },
        requestStatus: { [Op.notIn]: ['cancelled'] }
      },
      group: [literal("TO_CHAR(scheduled_date, 'Mon')"), literal("EXTRACT(MONTH FROM scheduled_date)")],
      order: [[literal("EXTRACT(MONTH FROM scheduled_date)"), 'ASC']],
      raw: true
    });

    const monthlyData = monthlyRaw.map(row => ({
      month: row.month?.trim() || '',
      collections: parseInt(row.collections) || 0,
      recycled: parseInt(row.recycled) || 0
    }));

    res.status(200).json({
      dryWaste,
      wetWaste,
      hazardousWaste,
      totalCollections,
      totalWeight: Math.round(totalWeight),
      fullBins,
      activeCitizens,
      weeklyData,
      monthlyData
    })
  })
}

export default new PickupRequestController()
