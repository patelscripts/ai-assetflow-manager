import express from 'express';
import Asset from '../models/Asset.model.js';
import Allocation from '../models/Allocation.model.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const assetsAllocated = await Allocation.countDocuments({
      allocatedTo: userId,
      status: 'Active',
    });

    const assetsAvailable = await Asset.countDocuments({
      status: 'Available',
    }); // ye global reh sakta hai

    const assetsUnderMaintenance = await Asset.countDocuments({
      status: 'Under Maintenance',
    });

    const activeAllocations = await Allocation.countDocuments({
      allocatedTo: userId,
      status: 'Active',
    });

    const overdueReturns = await Allocation.find({
      allocatedTo: userId, 
      status: 'Active',
      expectedReturnDate: { $lt: new Date() },
    })
      .populate('asset', 'name assetTag')
      .populate('allocatedTo', 'name email');

    const upcoming = new Date();
    upcoming.setDate(upcoming.getDate() + 7);

    const upcomingReturns = await Allocation.find({
      allocatedTo: userId, 
      status: 'Active',
      expectedReturnDate: { $gte: new Date(), $lte: upcoming },
    })
      .populate('asset', 'name assetTag')
      .populate('allocatedTo', 'name email');

    res.json({
      kpis: {
        assetsAvailable,              
        assetsAllocated,              
        assetsUnderMaintenance,       
        activeAllocations,            
        maintenanceToday: 0,
        activeBookings: 0,
        pendingTransfers: 0,
      },
      overdueReturns,
      upcomingReturns,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
export default router;