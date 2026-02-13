import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Complaint = sequelize.define('Complaint', {
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
  category: {
    type: DataTypes.ENUM(
      'missed_pickup',
      'bin_overflow',
      'improper_disposal',
      'collector_behavior',
      'other'
    ),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('submitted', 'in_review', 'resolved', 'dismissed'),
    defaultValue: 'submitted',
    allowNull: false
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'complaints',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['citizen_id'] },
    { fields: ['status'] },
    { fields: ['category'] }
  ]
});

// Associations
User.hasMany(Complaint, {
  foreignKey: 'citizenId',
  as: 'complaints',
  onDelete: 'CASCADE'
});

Complaint.belongsTo(User, {
  foreignKey: 'citizenId',
  as: 'citizen'
});

export default Complaint;
