import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SystemSettings = sequelize.define('SystemSettings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  value: {
    type: DataTypes.JSON,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'general'
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'system_settings',
  timestamps: true,
  underscored: true
});

export default SystemSettings;
