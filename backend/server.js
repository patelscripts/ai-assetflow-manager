import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDb from './config/db.js';
import authRoutes from './routes/auth.js'

const app = express();

app.use(cors());
app.use(express.json());
connectDb();

app.use('/api/auth',authRoutes)
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`server is running on the http://localhost:${PORT}`)
})
