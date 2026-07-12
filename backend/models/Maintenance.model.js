import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema(
  {
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issue: { type: String, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },

    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'In Progress', 'Resolved'],
      default: 'Pending',
    },

    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolutionNote: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Maintenance', maintenanceSchema);