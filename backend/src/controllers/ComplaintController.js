import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AppError } from '../middleware/errorHandler.js';

export class ComplaintController {
  // Citizen: submit a complaint
  create = asyncHandler(async (req, res) => {
    const { category, description, location } = req.body;

    if (!category || !description) {
      throw new AppError('Category and description are required', 400);
    }

    const complaint = await Complaint.create({
      citizenId: req.user.id,
      category,
      description,
      location: location || null,
      status: 'submitted'
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: complaint
    });
  });

  // Citizen: get own complaints
  getMyComplaints = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { citizenId: req.user.id };
    if (status) where.status = status;

    const { count, rows } = await Complaint.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        complaints: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  });

  // Admin: get all complaints
  getAllComplaints = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status, category } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const { count, rows } = await Complaint.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'citizen',
        attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber']
      }],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        complaints: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  });

  // Admin: update complaint status
  updateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const complaint = await Complaint.findByPk(id);
    if (!complaint) {
      throw new AppError('Complaint not found', 404);
    }

    const updateData = { status };
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (status === 'resolved') updateData.resolvedAt = new Date();

    await complaint.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Complaint status updated',
      data: complaint
    });
  });
}

export default new ComplaintController();
