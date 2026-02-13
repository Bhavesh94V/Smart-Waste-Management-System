import Bin from '../models/Bin.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

class BinController {

  getNearbyBins = asyncHandler(async (req, res) => {
    const bins = await Bin.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: bins
    });
  });

  createBin = asyncHandler(async (req, res) => {
    const { location, wasteType, fillLevel = 0, status = 'empty' } = req.body;

    if (!location || !wasteType) {
      throw new AppError('Location and waste type are required', 400);
    }

    const bin = await Bin.create({
      location,
      wasteType,
      fillLevel,
      status
    });

    res.status(201).json({
      success: true,
      message: 'Bin created successfully',
      data: bin
    });
  });

  updateBin = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { location, wasteType, fillLevel, status, lastCollected } = req.body;

    const bin = await Bin.findByPk(id);
    if (!bin) {
      throw new AppError('Bin not found', 404);
    }

    if (location !== undefined) bin.location = location;
    if (wasteType !== undefined) bin.wasteType = wasteType;
    if (fillLevel !== undefined) {
      bin.fillLevel = fillLevel;
      // Auto-update status based on fill level
      if (fillLevel >= 80) bin.status = 'full';
      else if (fillLevel >= 40) bin.status = 'half';
      else bin.status = 'empty';
    }
    if (status !== undefined) bin.status = status;
    if (lastCollected !== undefined) bin.lastCollected = lastCollected;

    await bin.save();

    res.status(200).json({
      success: true,
      message: 'Bin updated successfully',
      data: bin
    });
  });

  deleteBin = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const bin = await Bin.findByPk(id);
    if (!bin) {
      throw new AppError('Bin not found', 404);
    }

    await bin.destroy();

    res.status(200).json({
      success: true,
      message: 'Bin deleted successfully'
    });
  });

  updateFillLevel = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { fillLevel } = req.body;

    if (fillLevel === undefined || fillLevel < 0 || fillLevel > 100) {
      throw new AppError('Fill level must be between 0 and 100', 400);
    }

    const bin = await Bin.findByPk(id);
    if (!bin) {
      throw new AppError('Bin not found', 404);
    }

    bin.fillLevel = fillLevel;
    if (fillLevel >= 80) bin.status = 'full';
    else if (fillLevel >= 40) bin.status = 'half';
    else bin.status = 'empty';

    await bin.save();

    res.status(200).json({
      success: true,
      message: 'Bin fill level updated',
      data: bin
    });
  });

  markCollected = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const bin = await Bin.findByPk(id);
    if (!bin) {
      throw new AppError('Bin not found', 404);
    }

    bin.fillLevel = 0;
    bin.status = 'empty';
    bin.lastCollected = new Date();
    await bin.save();

    res.status(200).json({
      success: true,
      message: 'Bin marked as collected',
      data: bin
    });
  });
}

export default new BinController();
