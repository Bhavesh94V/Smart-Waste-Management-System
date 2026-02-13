import AuthService from '../services/AuthService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export class AuthController {
  register = asyncHandler(async (req, res) => {
    const result = await AuthService.register(req.body);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: result
    });
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  });

  logout = asyncHandler(async (req, res) => {
    const result = await AuthService.logout(req.user.id);
    res.status(200).json({
      success: true,
      message: result.message
    });
  });

  getProfile = asyncHandler(async (req, res) => {
    const profile = await AuthService.getUserProfile(req.user.id);
    res.status(200).json({
      success: true,
      data: profile
    });
  });

  updateProfile = asyncHandler(async (req, res) => {
    const profile = await AuthService.updateProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });
  });

  changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const result = await AuthService.changePassword(req.user.id, oldPassword, newPassword);
    res.status(200).json({
      success: true,
      message: result.message
    });
  });
}

export default new AuthController();
