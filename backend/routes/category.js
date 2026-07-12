import express from 'express';
import AssetCategory from '../models/AssetCategory.model.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET all categories
router.get('/', protect, async (req, res) => {
  try {
    const categories = await AssetCategory.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE category — Admin only (bonus, useful later)
router.post('/', protect, async (req, res) => {
  try {
    const category = await AssetCategory.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;