import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDb from './config/db.js';
import authRoutes from './routes/auth.js'
import assetRoutes from './routes/asset.js'
import categoryRoutes from './routes/category.js';
import allocationRoutes from './routes/allocation.js';
import dashboardRoutes from './routes/dashboard.js';
import bookingRoutes from './routes/booking.js';

const app = express();

app.use(cors());
app.use(express.json())
connectDb();

// routes
app.use('/api/auth',authRoutes);
app.use('/api/assets',assetRoutes);
app.use('/api/categories', categoryRoutes); 
app.use('/api/allocations', allocationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, ()=>{
    console.log(`server is running on the http://localhost:${PORT}`)
})
