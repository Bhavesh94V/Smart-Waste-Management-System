import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import PickupRequest from './PickupRequest.js';
import User from './User.js';

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  pickupRequestId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: PickupRequest,
      key: 'id'
    },
    unique: true
  },
  citizenId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  serviceCharge: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'INR',
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM(
      'credit_card',
      'debit_card',
      'upi',
      'bank_transfer',
      'wallet',
      'cash_on_collection'
    ),
    allowNull: true,
    defaultValue: null
  },
  paymentStatus: {
    type: DataTypes.ENUM(
      'pending',
      'initiated',
      'processing',
      'completed',
      'failed',
      'refunded',
      'cancelled'
    ),
    defaultValue: 'pending',
    allowNull: false
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  paymentGateway: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'e.g., Razorpay, Stripe, PayPal'
  },
  paymentReference: {
    type: DataTypes.STRING,
    allowNull: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  invoiceDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  paymentNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  failureReason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refundReason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  receiptUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'payments',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['pickup_request_id'] },
    { fields: ['citizen_id'] },
    { fields: ['payment_status'] },
    { fields: ['transaction_id'] }
  ]
});

// Associations
PickupRequest.hasOne(Payment, {
  foreignKey: 'pickupRequestId',
  as: 'payment',
  onDelete: 'CASCADE'
});

Payment.belongsTo(PickupRequest, {
  foreignKey: 'pickupRequestId',
  as: 'pickupRequest'
});

User.hasMany(Payment, {
  foreignKey: 'citizenId',
  as: 'payments',
  onDelete: 'CASCADE'
});

Payment.belongsTo(User, {
  foreignKey: 'citizenId',
  as: 'citizen'
});

export default Payment;
