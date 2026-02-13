import User from '../models/User.js';
import PickupRequest from '../models/PickupRequest.js';
import Bin from '../models/Bin.js';
import SystemSettings from '../models/SystemSettings.js';
import { Op, fn, col, literal } from 'sequelize';

export const getWasteAnalytics = async (req, res) => {
  try {
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

    const [totalCollections, fullBins, activeCitizens] = await Promise.all([
      PickupRequest.count({ where: { requestStatus: { [Op.in]: ['collected', 'verified', 'completed'] } } }),
      Bin.count({ where: { status: 'full' } }),
      User.count({ where: { role: 'citizen', status: 'active' } })
    ]);

    // Weekly data - last 7 days
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

    res.json({
      dryWaste,
      wetWaste,
      hazardousWaste,
      totalCollections,
      totalWeight: Math.round(totalWeight),
      fullBins,
      activeCitizens,
      weeklyData,
      monthlyData
    });
  } catch (error) {
    console.error('getWasteAnalytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 50, search } = req.query;
    const where = {};

    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password', 'loginAttempts', 'lockoutUntil'] },
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    res.status(200).json({
      success: true,
      data: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit)),
        items: rows
      }
    });
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = status;
    await user.save();

    const { password, loginAttempts, lockoutUntil, ...publicUser } = user.toJSON();

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: publicUser
    });
  } catch (error) {
    console.error('updateUserStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
};

// ==================== SETTINGS ====================

const DEFAULT_SETTINGS = {
  systemName: { value: 'Smart Waste Management System', category: 'general' },
  adminEmail: { value: 'admin@wms.com', category: 'general' },
  timezone: { value: 'IST', category: 'general' },
  emailNotifications: { value: true, category: 'notifications' },
  smsNotifications: { value: true, category: 'notifications' },
  notificationFrequency: { value: 'immediate', category: 'notifications' },
  autoAssignment: { value: false, category: 'collection' },
  operatingHoursStart: { value: '06:00', category: 'collection' },
  operatingHoursEnd: { value: '20:00', category: 'collection' },
  maxPickupsPerCollector: { value: 15, category: 'collection' },
  dryWastePrice: { value: 50, category: 'pricing' },
  wetWastePrice: { value: 30, category: 'pricing' },
  hazardousWastePrice: { value: 100, category: 'pricing' },
  sessionTimeout: { value: 30, category: 'security' },
  maxLoginAttempts: { value: 5, category: 'security' },
  maintenanceMode: { value: false, category: 'security' },
  smsGatewayApiKey: { value: '', category: 'api' },
  paymentGatewayApiKey: { value: '', category: 'api' },
  mapsApiKey: { value: '', category: 'api' }
};

export const getSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.findAll({ raw: true });

    // Build a map from DB settings, falling back to defaults
    const result = {};
    for (const [key, def] of Object.entries(DEFAULT_SETTINGS)) {
      const dbSetting = settings.find(s => s.key === key);
      result[key] = dbSetting ? dbSetting.value : def.value;
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('getSettings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
};

export const saveSettings = async (req, res) => {
  try {
    const settingsToSave = req.body;

    if (!settingsToSave || typeof settingsToSave !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid settings data' });
    }

    const promises = Object.entries(settingsToSave).map(async ([key, value]) => {
      const category = DEFAULT_SETTINGS[key]?.category || 'general';
      await SystemSettings.upsert({
        key,
        value: JSON.stringify(value) === JSON.stringify(value) ? value : value,
        category,
        updatedBy: req.user?.id || null
      });
    });

    await Promise.all(promises);

    // Return saved settings
    const allSettings = await SystemSettings.findAll({ raw: true });
    const result = {};
    for (const [key, def] of Object.entries(DEFAULT_SETTINGS)) {
      const dbSetting = allSettings.find(s => s.key === key);
      result[key] = dbSetting ? dbSetting.value : def.value;
    }

    res.status(200).json({
      success: true,
      message: 'Settings saved successfully',
      data: result
    });
  } catch (error) {
    console.error('saveSettings error:', error);
    res.status(500).json({ success: false, message: 'Failed to save settings' });
  }
};
