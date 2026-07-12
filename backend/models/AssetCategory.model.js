import mongoose from 'mongoose';

const assetCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, 
    customFields: [
      {
        key: { type: String },  
        type: { type: String },  
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('AssetCategory', assetCategorySchema);