import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Bin = sequelize.define('Bin', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fillLevel: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('empty', 'half', 'full'),
    defaultValue: 'empty'
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
  lastCollected: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'bins',
  timestamps: true,
  underscored: true
});

export default Bin;
