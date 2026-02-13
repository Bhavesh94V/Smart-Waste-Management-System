import { body, validationResult } from 'express-validator'

// Validation middleware wrapper
export const validate = validations => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)))

    // Check for errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      })
    }
    next()
  }
}

// Common validations
export const authValidations = {
  register: [
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ min: 2 })
      .withMessage('First name must be at least 2 characters'),

    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ min: 2 })
      .withMessage('Last name must be at least 2 characters'),

    body('email')
      .trim()
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),

    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),

    body('role')
      .isIn(['citizen', 'collector', 'admin'])
      .withMessage('Invalid role'),

    body('phoneNumber')
      .optional()
      .matches(/^[+]?[0-9\s\-()]+$/)
      .withMessage('Invalid phone number'),

    body('address').optional().trim()
  ],

  login: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),

    body('password').notEmpty().withMessage('Password is required')
  ]
}

export const pickupRequestValidations = {
  create: [
    body('wasteType')
      .isIn([
        'biodegradable',
        'recyclable',
        'hazardous',
        'mixed',
        'e-waste',
        'other'
      ])
      .withMessage('Invalid waste type'),
    body('wasteQuantity')
      .isFloat({ min: 0.1 })
      .withMessage('Waste quantity must be greater than 0'),
    body('pickupAddress')
      .trim()
      .notEmpty()
      .withMessage('Pickup address is required'),
    body('scheduledDate')
      .isISO8601()
      .withMessage('Valid scheduled date is required'),
    body('preferredTimeSlot')
      .isIn(['8AM-11AM', '11AM-2PM', '2PM-5PM', '5PM-8PM'])
      .withMessage('Invalid time slot'),
    body('description').optional().trim(),
    body('pickupLatitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Invalid latitude'),
    body('pickupLongitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Invalid longitude')
  ],

  updateStatus: [
    body('requestStatus')
      .isIn([
        'pending',
        'assigned',
        'accepted',
        'rejected',
        'in_transit',
        'collected',
        'verified',
        'completed',
        'cancelled'
      ])
      .withMessage('Invalid status'),
    body('notes').optional().trim()
  ]
}

export const paymentValidations = {
  initiate: [
    body('pickupRequestId')
      .notEmpty()
      .withMessage('Pickup request ID is required'),
    body('paymentMethod')
      .isIn([
        'credit_card',
        'debit_card',
        'upi',
        'bank_transfer',
        'wallet',
        'cash_on_collection'
      ])
      .withMessage('Invalid payment method')
  ]
}
