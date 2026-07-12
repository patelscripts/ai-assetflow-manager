import express from 'express';
import User from '../models/User.model.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET all users — Admin/AssetManager only
router.get('/', protect, restrictTo('Admin', 'AssetManager'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;