import express from 'express';
import Asset from '../models/Asset.model.js';
import Allocation from '../models/Allocation.model.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// ALLOCATE asset to employee/department
router.post('/', protect, restrictTo('AssetManager', 'Admin'), async (req, res) => {
  try {
    const { assetId, allocatedTo, department, expectedReturnDate } = req.body;

    const asset = await Asset.findById(assetId).populate('currentHolder', 'name email');

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // CONFLICT CHECK — already allocated?
    if (asset.status === 'Allocated' || asset.currentHolder) {
      return res.status(409).json({
        message: `Asset currently held by ${asset.currentHolder?.name || 'someone else'}`,
        currentHolder: asset.currentHolder,
        suggestion: 'Use Transfer Request instead',
      });
    }

    // Create allocation record
    const allocation = await Allocation.create({
      asset: asset._id,
      allocatedTo,
      department,
      allocatedBy: req.user.id,
      expectedReturnDate,
      status: 'Active',
    });

    // Update asset status + holder
    asset.status = 'Allocated';
    asset.currentHolder = allocatedTo;
    await asset.save();

    res.status(201).json(allocation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// RETURN asset
router.put('/:id/return', protect, restrictTo('AssetManager', 'Admin'), async (req, res) => {
  try {
    const { conditionNoteOnReturn } = req.body;

    const allocation = await Allocation.findById(req.params.id);
    if (!allocation) return res.status(404).json({ message: 'Allocation not found' });

    allocation.status = 'Returned';
    allocation.actualReturnDate = new Date();
    allocation.conditionNoteOnReturn = conditionNoteOnReturn;
    await allocation.save();

    // Reset asset
    const asset = await Asset.findById(allocation.asset);
    asset.status = 'Available';
    asset.currentHolder = null;
    await asset.save();

    res.json({ message: 'Asset returned successfully', allocation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all allocations (with overdue flag)
router.get('/', protect, async (req, res) => {
  try {
    const allocations = await Allocation.find()
      .populate('asset', 'name assetTag')
      .populate('allocatedTo', 'name email')
      .populate('department', 'name');

    const withOverdueFlag = allocations.map((a) => {
      const isOverdue =
        a.status === 'Active' &&
        a.expectedReturnDate &&
        new Date(a.expectedReturnDate) < new Date();
      return { ...a.toObject(), isOverdue };
    });

    res.json(withOverdueFlag);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;