import express from 'express';
import Booking from '../models/Booking.model.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// CREATE booking — overlap validation
router.post('/', protect, async (req, res) => {
  try {
    const { resource, startTime, endTime } = req.body;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    // OVERLAP CHECK
    const overlap = await Booking.findOne({
      resource,
      status: { $in: ['Upcoming', 'Ongoing'] },
      startTime: { $lt: end },
      endTime: { $gt: start },
    });

    if (overlap) {
      return res.status(409).json({
        message: 'This resource is already booked for the selected time slot',
        conflictingBooking: overlap,
      });
    }

    const booking = await Booking.create({
      resource,
      bookedBy: req.user.id,
      department: req.body.department,
      startTime: start,
      endTime: end,
      status: 'Upcoming',
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all bookings (optionally filter by resource)
router.get('/', protect, async (req, res) => {
  try {
    const { resource } = req.query;
    const filter = resource ? { resource } : {};

    const bookings = await Booking.find(filter)
      .populate('resource', 'name assetTag')
      .populate('bookedBy', 'name email');

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CANCEL booking
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;