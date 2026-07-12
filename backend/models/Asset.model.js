import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    assetTag: { type: String, required: true, unique: true }, // AF-0001
    serialNumber: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'AssetCategory', required: true },
    acquisitionDate: { type: Date },
    acquisitionCost: { type: Number },
    condition: { type: String, enum: ['New', 'Good', 'Fair', 'Poor'], default: 'Good' },
    location: { type: String },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    isBookable: { type: Boolean, default: false }, 
    photoUrl: { type: String },

    status: {
      type: String,
      enum: ['Available', 'Allocated', 'Reserved', 'Under Maintenance', 'Lost', 'Retired', 'Disposed'],
      default: 'Available',
    },

    // quick-access current holder (denormalized for fast lookup)
    currentHolder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Asset', assetSchema);