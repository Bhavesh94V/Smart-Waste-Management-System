import mongoose from 'mongoose';

const IoTSensorDataSchema = new mongoose.Schema({
  binId: {
    type: String,
    required: true,
    index: true
  },
  binLocation: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    address: String
  },
  sensorReadings: {
    fillLevel: {
      type: Number,
      required: true,
      comment: '0-100 percentage'
    },
    weight: {
      type: Number,
      comment: 'kg'
    },
    temperature: {
      type: Number,
      comment: 'Celsius'
    },
    humidity: {
      type: Number,
      comment: 'percentage'
    },
    methaneLevel: {
      type: Number,
      comment: 'ppm'
    },
    odorLevel: {
      type: Number,
      comment: '0-10 scale'
    }
  },
  wasteType: {
    type: String,
    enum: ['biodegradable', 'recyclable', 'hazardous', 'mixed', 'e-waste'],
    required: true
  },
  status: {
    type: String,
    enum: ['empty', 'low', 'medium', 'high', 'full', 'overflow', 'offline'],
    default: 'offline'
  },
  lastCollectionTime: Date,
  nextScheduledCollection: Date,
  collectionHistory: [{
    collectionDate: Date,
    collectorId: String,
    quantityCollected: Number,
    notes: String
  }],
  alert: {
    type: String,
    enum: ['none', 'overfull', 'temperature_high', 'gas_leak', 'offline'],
    default: 'none'
  },
  alertTriggeredAt: Date,
  systemIntegrity: {
    batteryLevel: Number,
    signalStrength: Number,
    lastSync: Date
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Create compound index for faster queries
IoTSensorDataSchema.index({ binId: 1, timestamp: -1 });
IoTSensorDataSchema.index({ status: 1, timestamp: -1 });

export const IoTSensorData = mongoose.model('IoTSensorData', IoTSensorDataSchema);
