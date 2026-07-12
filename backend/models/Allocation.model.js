import mongoose from 'mongoose';

const allocationSchema = new mongoose.Schema(
  {
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    allocatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    allocatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    allocationDate: { type: Date, default: Date.now },
    expectedReturnDate: { type: Date },
    actualReturnDate: { type: Date },

    conditionNoteOnReturn: { type: String },

    status: {
      type: String,
      enum: ['Active', 'Returned', 'Overdue', 'TransferRequested', 'Transferred'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Allocation', allocationSchema);