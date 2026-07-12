import express from 'express';
import Maintenance from '../models/Maintenance.model.js';
import Asset from '../models/Asset.model.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// RAISE request — any logged-in user
router.post('/', protect, async (req, res) => {
  try {
    const { asset, issue, priority } = req.body;

    const request = await Maintenance.create({
      asset,
      raisedBy: req.user.id,
      issue,
      priority: priority || 'Medium',
      status: 'Pending',
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all requests
router.get('/', protect, async (req, res) => {
  try {
    const requests = await Maintenance.find()
      .populate('asset', 'name assetTag status')
      .populate('raisedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// APPROVE / REJECT — Asset Manager/Admin only
router.put('/:id/decision', protect, restrictTo('AssetManager', 'Admin'), async (req, res) => {
  try {
    const { decision } = req.body;

    const request = await Maintenance.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = decision;
    request.approvedBy = req.user.id;
    await request.save();

    if (decision === 'Approved') {
      await Asset.findByIdAndUpdate(request.asset, { status: 'Under Maintenance' });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// RESOLVE — Asset Manager/Admin only
router.put('/:id/resolve', protect, restrictTo('AssetManager', 'Admin'), async (req, res) => {
  try {
    const { resolutionNote } = req.body;

    const request = await Maintenance.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'Resolved';
    request.resolutionNote = resolutionNote;
    await request.save();

    await Asset.findByIdAndUpdate(request.asset, { status: 'Available' });

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;