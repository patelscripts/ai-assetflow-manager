import express from 'express';
import Asset from '../models/Asset.model.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// CREATE asset — Asset Manager / Admin only
router.post('/', protect, restrictTo('AssetManager', 'Admin'), async (req, res) => {
  try {
    const count = await Asset.countDocuments();
    const assetTag = `AF-${String(count + 1).padStart(4, '0')}`;

    const asset = await Asset.create({
      ...req.body,
      assetTag,
      status: 'Available',
    });

    return res.status(201).json(asset);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// GET all assets — with search/filter
router.get('/', protect, async (req, res) => {
  try {
    const { category, status, department, location, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (location) filter.location = location;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { assetTag: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const assets = await Asset.find(filter)
      .populate('category', 'name')
      .populate('department', 'name')
      .populate('currentHolder', 'name email');

    res.json(assets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single asset by ID (with history — allocation history comes later)
router.get('/:id', protect, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('category', 'name')
      .populate('department', 'name')
      .populate('currentHolder', 'name email');

    if (!asset) return res.status(404).json({ message: 'Asset not found' });

    return res.json(asset);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// UPDATE asset
router.put('/:id', protect, restrictTo('AssetManager', 'Admin'), async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    return res.json(asset);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// DELETE asset (optional — maybe skip in demo, but good to have)
router.delete('/:id', protect, restrictTo('Admin'), async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    return res.json({ message: 'Asset deleted' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;