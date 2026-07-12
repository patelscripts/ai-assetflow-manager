import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import User from '../models/User.model.js';
import Department from '../models/Department.model.js';
import AssetCategory from '../models/AssetCategory.model.js';

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data (fresh seed)
    await User.deleteMany({});
    await Department.deleteMany({});
    await AssetCategory.deleteMany({});

    // 1. Create Admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@assetflow.com',
      password: hashedPassword,
      role: 'Admin',
    });
    console.log('Admin created:', admin.email);

    // 2. Create Departments
    const departments = await Department.insertMany([
      { name: 'IT', head: admin._id, status: 'Active' },
      { name: 'HR', status: 'Active' },
      { name: 'Operations', status: 'Active' },
    ]);
    console.log('Departments created:', departments.map(d => d.name));

    // 3. Create Asset Categories
    const categories = await AssetCategory.insertMany([
      { name: 'Electronics', customFields: [{ key: 'warrantyPeriod', type: 'text' }] },
      { name: 'Furniture', customFields: [] },
      { name: 'Vehicles', customFields: [{ key: 'registrationNumber', type: 'text' }] },
      { name: 'Rooms', customFields: [] }, // bookable rooms ke liye
    ]);
    console.log('Categories created:', categories.map(c => c.name));

    console.log('\n✅ Seeding complete!');
    console.log('Admin login → email: admin@assetflow.com | password: admin123');

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedData();