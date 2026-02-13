import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const CollectorRoute = sequelize.define('CollectorRoute', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  collectorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  routeName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  assignedDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  routeStatus: {
    type: DataTypes.ENUM(
      'active',
      'inactive',
      'completed',
      'on_hold'
    ),
    defaultValue: 'active',
    allowNull: false
  },
  wastePickupPoints: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of pickup locations with coordinates'
  },
  estimatedDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in minutes'
  },
  actualDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in minutes'
  },
  totalDistance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Distance in km'
  },
  totalWasteCollected: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    allowNull: false,
    comment: 'Total waste in kg'
  },
  recyclableWaste: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Recyclable waste in kg'
  },
  biodegradableWaste: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Biodegradable waste in kg'
  },
  hazardousWaste: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Hazardous waste in kg'
  },
  routeStartTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  routeEndTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'collector_routes',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['collector_id'] },
    { fields: ['route_status'] }
  ]
});

// Associations
User.hasMany(CollectorRoute, {
  foreignKey: 'collectorId',
  as: 'routes',
  onDelete: 'CASCADE'
});

CollectorRoute.belongsTo(User, {
  foreignKey: 'collectorId',
  as: 'collector'
});

export default CollectorRoute;
