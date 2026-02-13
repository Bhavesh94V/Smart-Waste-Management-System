import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  userRole: {
    type: DataTypes.ENUM('admin', 'citizen', 'collector', 'system'),
    allowNull: false
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g., CREATE_REQUEST, UPDATE_STATUS, ASSIGN_COLLECTOR'
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g., PickupRequest, Payment, User'
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID of the entity that was modified'
  },
  changes: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Before and after values'
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('success', 'failure'),
    defaultValue: 'success',
    allowNull: false
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['action'] },
    { fields: ['entity_type'] },
    { fields: ['created_at'] }
  ]
});

// Associations
User.hasMany(AuditLog, {
  foreignKey: 'userId',
  as: 'auditLogs',
  onDelete: 'SET NULL'
});

AuditLog.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

export default AuditLog;
