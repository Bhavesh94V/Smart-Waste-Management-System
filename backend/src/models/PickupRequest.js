import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const PickupRequest = sequelize.define('PickupRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  citizenId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  collectorId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  wasteType: {
    type: DataTypes.ENUM(
      'biodegradable',
      'recyclable',
      'hazardous',
      'mixed',
      'e-waste',
      'other'
    ),
    allowNull: false
  },
  wasteQuantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Quantity in kg'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pickupAddress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pickupLatitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  pickupLongitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  preferredTimeSlot: {
    type: DataTypes.ENUM(
      '8AM-11AM',
      '11AM-2PM',
      '2PM-5PM',
      '5PM-8PM'
    ),
    allowNull: false
  },
  requestStatus: {
    type: DataTypes.ENUM(
      'pending',
      'assigned',
      'accepted',
      'rejected',
      'in_transit',
      'collected',
      'verified',
      'completed',
      'cancelled'
    ),
    defaultValue: 'pending',
    allowNull: false
  },
  collectorAcceptanceTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  collectionTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  verificationTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  verificationNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancellationReason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cancelledBy: {
    type: DataTypes.ENUM('citizen', 'collector', 'admin'),
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
    allowNull: false
  },
  estimatedServiceCharge: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  imageProof: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of image URLs'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'pickup_requests',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['citizen_id'] },
    { fields: ['collector_id'] },
    { fields: ['request_status'] },
    { fields: ['scheduled_date'] }
  ]
});

// Associations
User.hasMany(PickupRequest, {
  foreignKey: 'citizenId',
  as: 'citizenRequests',
  onDelete: 'CASCADE'
});

PickupRequest.belongsTo(User, {
  foreignKey: 'citizenId',
  as: 'citizen'
});

User.hasMany(PickupRequest, {
  foreignKey: 'collectorId',
  as: 'collectorAssignments',
  onDelete: 'SET NULL'
});

PickupRequest.belongsTo(User, {
  foreignKey: 'collectorId',
  as: 'collector'
});

export default PickupRequest;
