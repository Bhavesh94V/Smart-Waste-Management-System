import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { generateToken, generateRefreshToken } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export class AuthService {
  async register(registerData) {
    const { firstName, lastName, email, password, role, phoneNumber, address, city, state, pincode } = registerData;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'citizen',
      phoneNumber,
      address,
      city,
      state,
      pincode,
      status: 'active'
    });

    // Log audit
    await this.logAudit({
      userId: user.id,
      userRole: 'system',
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user.id,
      status: 'success'
    });

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
      user: user.toPublicJSON(),
      token,
      refreshToken,
      expiresIn: '7d'
    };
  }

  async login(email, password) {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check account status
    if (user.status === 'suspended') {
      throw new AppError('Account is suspended', 403);
    }

    // Check if account is locked
    if (user.lockoutUntil && new Date() < user.lockoutUntil) {
      throw new AppError('Account is locked. Please try again later.', 429);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
      
      await user.save();

      // Log failed attempt
      await this.logAudit({
        userId: user.id,
        userRole: user.role,
        action: 'LOGIN_FAILED',
        entityType: 'User',
        entityId: user.id,
        status: 'failure',
        errorMessage: 'Invalid password'
      });

      throw new AppError('Invalid email or password', 401);
    }

    // Reset login attempts and lockout
    user.loginAttempts = 0;
    user.lockoutUntil = null;
    user.lastLogin = new Date();
    user.isOnline = true;
    await user.save();

    // Log successful login
    await this.logAudit({
      userId: user.id,
      userRole: user.role,
      action: 'LOGIN_SUCCESS',
      entityType: 'User',
      entityId: user.id,
      status: 'success'
    });

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
      user: user.toPublicJSON(),
      token,
      refreshToken,
      expiresIn: '7d'
    };
  }

  async logout(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.isOnline = false;
    await user.save();

    await this.logAudit({
      userId: user.id,
      userRole: user.role,
      action: 'LOGOUT',
      entityType: 'User',
      entityId: user.id,
      status: 'success'
    });

    return { message: 'Logout successful' };
  }

  async getUserProfile(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user.toPublicJSON();
  }

  async updateProfile(userId, updateData) {
    const { firstName, lastName, phoneNumber, address, city, state, pincode, profileImage } = updateData;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Track changes for audit
    const changes = {};
    if (firstName && firstName !== user.firstName) changes.firstName = { old: user.firstName, new: firstName };
    if (lastName && lastName !== user.lastName) changes.lastName = { old: user.lastName, new: lastName };
    if (phoneNumber && phoneNumber !== user.phoneNumber) changes.phoneNumber = { old: user.phoneNumber, new: phoneNumber };

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) user.address = address;
    if (city) user.city = city;
    if (state) user.state = state;
    if (pincode) user.pincode = pincode;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    // Log audit if changes were made
    if (Object.keys(changes).length > 0) {
      await this.logAudit({
        userId: user.id,
        userRole: user.role,
        action: 'PROFILE_UPDATED',
        entityType: 'User',
        entityId: user.id,
        changes,
        status: 'success'
      });
    }

    return user.toPublicJSON();
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify old password
    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    await this.logAudit({
      userId: user.id,
      userRole: user.role,
      action: 'PASSWORD_CHANGED',
      entityType: 'User',
      entityId: user.id,
      status: 'success'
    });

    return { message: 'Password changed successfully' };
  }

  async logAudit(auditData) {
    try {
      await AuditLog.create(auditData);
    } catch (error) {
      console.error('Audit logging error:', error);
      // Don't throw, as we don't want audit failures to break the main operation
    }
  }
}

export default new AuthService();
