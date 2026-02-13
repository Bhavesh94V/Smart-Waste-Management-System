import express from 'express';
import { IoTSensorData } from '../models/IoTSensorData.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * @route   POST /api/iot/sensor-data
 * @desc    Receive IoT sensor data from smart bins
 * @access  Public (With API Key validation)
 */
router.post(
  '/sensor-data',
  asyncHandler(async (req, res) => {
    const { binId, location, sensorReadings, wasteType, status } = req.body;

    // Validate API key (implement your own validation)
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required'
      });
    }

    const sensorData = new IoTSensorData({
      binId,
      binLocation: {
        latitude: location?.latitude,
        longitude: location?.longitude,
        address: location?.address
      },
      sensorReadings: {
        fillLevel: sensorReadings?.fillLevel,
        weight: sensorReadings?.weight,
        temperature: sensorReadings?.temperature,
        humidity: sensorReadings?.humidity,
        methaneLevel: sensorReadings?.methaneLevel,
        odorLevel: sensorReadings?.odorLevel
      },
      wasteType,
      status,
      timestamp: new Date()
    });

    await sensorData.save();

    res.status(201).json({
      success: true,
      message: 'Sensor data received',
      data: sensorData
    });
  })
);

/**
 * @route   GET /api/iot/sensor-data/:binId
 * @desc    Get latest sensor data for a specific bin
 * @access  Private
 */
router.get(
  '/sensor-data/:binId',
  asyncHandler(async (req, res) => {
    const { binId } = req.params;
    const { limit = 100 } = req.query;

    const sensorData = await IoTSensorData.find({ binId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: sensorData
    });
  })
);

/**
 * @route   GET /api/iot/bins/status
 * @desc    Get status of all bins
 * @access  Private
 */
router.get(
  '/bins/status',
  asyncHandler(async (req, res) => {
    const { status, wasteType } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (wasteType) filters.wasteType = wasteType;

    const binsStatus = await IoTSensorData.find(filters)
      .sort({ timestamp: -1 });

    // Group by binId and get latest reading
    const latestStatus = {};
    binsStatus.forEach(reading => {
      if (!latestStatus[reading.binId] || new Date(reading.timestamp) > new Date(latestStatus[reading.binId].timestamp)) {
        latestStatus[reading.binId] = reading;
      }
    });

    res.status(200).json({
      success: true,
      data: Object.values(latestStatus)
    });
  })
);

/**
 * @route   GET /api/iot/alerts
 * @desc    Get active alerts from all bins
 * @access  Private
 */
router.get(
  '/alerts',
  asyncHandler(async (req, res) => {
    const alerts = await IoTSensorData.find({
      alert: { $ne: 'none' }
    })
      .sort({ alertTriggeredAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: alerts
    });
  })
);

/**
 * @route   POST /api/iot/bin/:binId/collection-logged
 * @desc    Log collection event for a bin
 * @access  Private
 */
router.post(
  '/bin/:binId/collection-logged',
  asyncHandler(async (req, res) => {
    const { binId } = req.params;
    const { collectorId, quantityCollected, notes } = req.body;

    // Update the latest sensor data record
    const latestReading = await IoTSensorData.findOne({ binId })
      .sort({ timestamp: -1 });

    if (latestReading) {
      latestReading.lastCollectionTime = new Date();
      latestReading.collectionHistory = latestReading.collectionHistory || [];
      latestReading.collectionHistory.push({
        collectionDate: new Date(),
        collectorId,
        quantityCollected,
        notes
      });
      latestReading.status = 'empty';
      await latestReading.save();
    }

    res.status(200).json({
      success: true,
      message: 'Collection event logged',
      data: latestReading
    });
  })
);

export default router;
